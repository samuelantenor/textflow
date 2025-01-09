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

    // First, get the campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*, user_id')  // Make sure to select user_id
      .eq('id', campaignId)
      .maybeSingle()

    if (campaignError) {
      console.error('Error fetching campaign:', campaignError)
      throw campaignError
    }
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    if (!campaign.group_id) {
      throw new Error('Campaign has no associated contact group')
    }

    // Then, get the contacts for this group
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

    // Construct the webhook URL using the Supabase project URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const webhookUrl = `${supabaseUrl}/functions/v1/twilio-webhook`
    console.log('Using webhook URL:', webhookUrl)

    // Send messages to all contacts
    const messagePromises = contacts.map(async (contact) => {
      try {
        console.log(`Sending message to ${contact.phone_number}`)
        
        const formData = new URLSearchParams({
          To: contact.phone_number,
          From: campaign.from_number || '+15146125967', // Using default number if not specified
          Body: campaign.message,
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

        // Log the message with user_id
        const { error: logError } = await supabaseClient
          .from('message_logs')
          .insert({
            campaign_id: campaignId,
            contact_id: contact.id,
            twilio_message_sid: result.sid,
            status: result.status,
            error_message: result.error_message,
            user_id: campaign.user_id  // Add the user_id from the campaign
          })

        if (logError) {
          console.error('Error creating message log:', logError)
          throw logError
        }

        return result
      } catch (error) {
        console.error(`Error sending message to ${contact.phone_number}:`, error)
        throw error
      }
    })

    await Promise.all(messagePromises)

    // Update campaign status to sent
    const { error: updateError } = await supabaseClient
      .from('campaigns')
      .update({ status: 'sent' })
      .eq('id', campaignId)

    if (updateError) {
      console.error('Error updating campaign status:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true }),
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