
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Update last processing started timestamp
    const { error: updateStartError } = await supabaseClient
      .from('campaigns')
      .update({ 
        last_processing_started: new Date().toISOString(),
        status: 'processing'
      })
      .eq('id', campaignId)

    if (updateStartError) {
      console.error('Error updating campaign start time:', updateStartError)
      throw updateStartError
    }

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
    if (campaign.status !== 'scheduled' && campaign.status !== 'draft') {
      console.log(`Campaign ${campaignId} is already ${campaign.status}, skipping`)
      return new Response(
        JSON.stringify({ success: false, message: `Campaign is already ${campaign.status}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (!campaign.group_id) {
      throw new Error('Campaign has no associated contact group')
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

    let errorCount = 0
    const errorMessages: string[] = []

    // Send messages to all contacts
    const messagePromises = contacts.map(async (contact) => {
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
          return null
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
          errorCount++
          errorMessages.push(`Error sending to ${contact.phone_number}: ${result.message}`)
          throw new Error(`Twilio error: ${result.message}`)
        }

        // Log the message
        const { error: logError } = await supabaseClient
          .from('message_logs')
          .insert({
            campaign_id: campaignId,
            contact_id: contact.id,
            twilio_message_sid: result.sid,
            status: result.status,
            error_message: result.error_message,
            user_id: campaign.user_id,
            contact_name: contact.name,
            contact_phone_number: contact.phone_number
          })

        if (logError) {
          console.error('Error creating message log:', logError)
          throw logError
        }

        return result
      } catch (error) {
        console.error(`Error sending message to ${contact.phone_number}:`, error)
        errorCount++
        errorMessages.push(error.message)
        throw error
      }
    })

    try {
      await Promise.all(messagePromises)
      
      // Update campaign status based on success/failure
      const finalStatus = errorCount === contacts.length ? 'failed' : 'sent'
      const { error: finalUpdateError } = await supabaseClient
        .from('campaigns')
        .update({ 
          status: finalStatus,
          error_log: errorMessages.length > 0 ? errorMessages.join('\n') : null,
          retry_count: campaign.retry_count + 1
        })
        .eq('id', campaignId)

      if (finalUpdateError) {
        console.error('Error updating campaign final status:', finalUpdateError)
        throw finalUpdateError
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          errorCount,
          totalContacts: contacts.length 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (error) {
      // Update campaign status to failed if all messages failed
      const { error: failureUpdateError } = await supabaseClient
        .from('campaigns')
        .update({ 
          status: 'failed',
          error_log: errorMessages.join('\n'),
          retry_count: campaign.retry_count + 1
        })
        .eq('id', campaignId)

      if (failureUpdateError) {
        console.error('Error updating campaign failure status:', failureUpdateError)
      }

      throw error
    }
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
