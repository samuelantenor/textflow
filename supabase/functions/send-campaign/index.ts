
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessageResult {
  success: boolean;
  contact_id: string | null;
  contact_phone_number: string;
  twilio_message_sid?: string;
  error_message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { campaignId } = await req.json()
    console.log('Processing campaign:', campaignId)

    // First, get the campaign details and check status
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*, user_id')
      .eq('id', campaignId)
      .single()

    if (campaignError) {
      console.error('Error fetching campaign:', campaignError)
      throw campaignError
    }
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    // Verify campaign status is valid for sending
    if (!['scheduled', 'draft'].includes(campaign.status)) {
      console.log(`Campaign ${campaignId} is ${campaign.status}, skipping`)
      return new Response(
        JSON.stringify({ success: false, message: `Campaign is ${campaign.status}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (!campaign.group_id) {
      throw new Error('Campaign has no associated contact group')
    }

    // Update processing started timestamp and status atomically
    const { error: updateStartError } = await supabaseClient
      .from('campaigns')
      .update({ 
        last_processing_started: new Date().toISOString(),
        status: 'processing'
      })
      .eq('id', campaignId)
      .eq('status', campaign.status) // Ensure status hasn't changed

    if (updateStartError) {
      console.error('Error updating campaign start time:', updateStartError)
      throw updateStartError
    }

    // Get contacts that haven't been messaged yet for this campaign
    const { data: contacts, error: contactsError } = await supabaseClient
      .from('contacts')
      .select('*')
      .eq('group_id', campaign.group_id)

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError)
      throw contactsError
    }

    if (!contacts || contacts.length === 0) {
      throw new Error('No contacts found in the group')
    }

    console.log(`Found ${contacts.length} contacts to message`)

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    // Construct the webhook URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const webhookUrl = `${supabaseUrl}/functions/v1/twilio-webhook`
    console.log('Using webhook URL:', webhookUrl)

    let successCount = 0
    let failureCount = 0
    const messageResults: MessageResult[] = []

    // Send messages to all contacts
    for (const contact of contacts) {
      try {
        // Check if message already exists for this contact and campaign
        const { data: existingMessage } = await supabaseClient
          .from('message_logs')
          .select('id, status')
          .eq('campaign_id', campaignId)
          .eq('contact_phone_number', contact.phone_number)
          .maybeSingle()

        if (existingMessage) {
          console.log(`Message already exists for contact ${contact.id} in campaign ${campaignId}`)
          if (existingMessage.status === 'delivered') successCount++
          continue
        }

        console.log(`Sending message to ${contact.phone_number}`)
        
        const formData = new URLSearchParams({
          To: contact.phone_number,
          From: campaign.from_number || '+15146125967',
          Body: campaign.message || '',
          StatusCallback: webhookUrl,
          ...(campaign.media_url ? { MediaUrl: campaign.media_url } : {}),
        })

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          }
        )

        const result = await response.json()
        console.log('Twilio response:', result)

        if (!response.ok) {
          failureCount++
          const errorMessage = `Error sending to ${contact.phone_number}: ${result.message}`
          messageResults.push({
            success: false,
            contact_id: contact.id,
            contact_phone_number: contact.phone_number,
            error_message: errorMessage
          })
          console.error(errorMessage)
          continue
        }

        // Log the message with error handling
        try {
          const { error: logError } = await supabaseClient
            .from('message_logs')
            .upsert({
              campaign_id: campaignId,
              contact_id: contact.id,
              twilio_message_sid: result.sid,
              status: result.status,
              error_message: result.error_message,
              user_id: campaign.user_id,
              contact_name: contact.name,
              contact_phone_number: contact.phone_number
            }, {
              onConflict: 'campaign_id,contact_phone_number'
            })

          if (logError) {
            console.error('Error creating message log:', logError)
            // Don't throw, just log the error
            messageResults.push({
              success: true,
              contact_id: contact.id,
              contact_phone_number: contact.phone_number,
              twilio_message_sid: result.sid,
              error_message: `Message sent but logging failed: ${logError.message}`
            })
          } else {
            successCount++
            messageResults.push({
              success: true,
              contact_id: contact.id,
              contact_phone_number: contact.phone_number,
              twilio_message_sid: result.sid
            })
          }
        } catch (logError) {
          console.error('Error in message logging:', logError)
          // Continue processing other messages
          messageResults.push({
            success: true,
            contact_id: contact.id,
            contact_phone_number: contact.phone_number,
            twilio_message_sid: result.sid,
            error_message: `Message sent but logging failed: ${logError.message}`
          })
        }
      } catch (error) {
        console.error(`Error processing contact ${contact.id}:`, error)
        failureCount++
        messageResults.push({
          success: false,
          contact_id: contact.id,
          contact_phone_number: contact.phone_number,
          error_message: error.message
        })
      }
    }

    // Determine final campaign status
    let finalStatus: string
    let errorLog: string | null = null

    if (failureCount === contacts.length) {
      finalStatus = 'failed'
      errorLog = 'All messages failed to send'
    } else if (failureCount > 0) {
      finalStatus = 'partially_sent'
      errorLog = `${failureCount} out of ${contacts.length} messages failed to send`
    } else {
      finalStatus = 'sent'
    }

    // Update campaign status
    const { error: finalUpdateError } = await supabaseClient
      .from('campaigns')
      .update({ 
        status: finalStatus,
        error_log: errorLog
      })
      .eq('id', campaignId)

    if (finalUpdateError) {
      console.error('Error updating campaign final status:', finalUpdateError)
      // Don't throw, we still want to return the results
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        totalContacts: contacts.length,
        successCount,
        failureCount,
        status: finalStatus,
        messageResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-campaign function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
