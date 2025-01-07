import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendCampaignRequest {
  campaignId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { campaignId } = await req.json() as SendCampaignRequest;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        campaign_groups (
          contacts (*)
        )
      `)
      .eq('id', campaignId)
      .single();

    if (campaignError) throw campaignError;

    // Initialize Twilio client
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    const contacts = campaign.campaign_groups.contacts;
    const results = [];

    // Send messages to all contacts in the group
    for (const contact of contacts) {
      try {
        // Send message via Twilio
        const twilioResponse = await fetch(
          `https://api.twilio.com/2010-04/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: contact.phone_number,
              From: campaign.from_number,
              Body: campaign.message,
              ...(campaign.media_url && { MediaUrl: campaign.media_url }),
            }),
          }
        );

        const messageData = await twilioResponse.json();

        // Log the message status
        const { data: logData, error: logError } = await supabase
          .from('message_logs')
          .insert({
            campaign_id: campaignId,
            contact_id: contact.id,
            twilio_message_sid: messageData.sid,
            status: messageData.status,
          });

        if (logError) throw logError;
        
        results.push({
          contact: contact.phone_number,
          status: 'sent',
          messageSid: messageData.sid,
        });

      } catch (error) {
        console.error(`Error sending message to ${contact.phone_number}:`, error);
        results.push({
          contact: contact.phone_number,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Update campaign status
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ status: 'sent' })
      .eq('id', campaignId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in send-campaign function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});