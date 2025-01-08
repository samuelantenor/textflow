import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Received webhook request:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the form data from Twilio webhook
    const formData = await req.formData()
    
    // Log all form data fields for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`Form data - ${key}:`, value);
    }
    
    const messageStatus = formData.get('MessageStatus')
    const messageSid = formData.get('MessageSid')
    
    if (!messageStatus || !messageSid) {
      console.error('Missing required fields:', { messageStatus, messageSid });
      throw new Error('Missing required fields: MessageStatus or MessageSid');
    }
    
    console.log(`Processing webhook for message ${messageSid} with status ${messageStatus}`);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find and update the message log
    const { data: messageLog, error: findError } = await supabaseClient
      .from('message_logs')
      .select('*')
      .eq('twilio_message_sid', messageSid)
      .single()

    if (findError) {
      console.error('Error finding message log:', findError);
      throw findError
    }

    if (!messageLog) {
      console.error('Message log not found for SID:', messageSid);
      throw new Error('Message log not found')
    }

    // Update message status
    const { error: updateError } = await supabaseClient
      .from('message_logs')
      .update({ 
        status: messageStatus,
        updated_at: new Date().toISOString()
      })
      .eq('twilio_message_sid', messageSid)

    if (updateError) {
      console.error('Error updating message log:', updateError);
      throw updateError
    }

    console.log('Successfully updated message status');

    // Update campaign analytics
    await updateCampaignAnalytics(supabaseClient, messageLog.campaign_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function updateCampaignAnalytics(supabaseClient: any, campaignId: string) {
  try {
    // Get all message logs for the campaign
    const { data: messageLogs, error: messageLogsError } = await supabaseClient
      .from('message_logs')
      .select('status')
      .eq('campaign_id', campaignId)

    if (messageLogsError) {
      console.error('Error fetching message logs:', messageLogsError);
      throw messageLogsError;
    }

    // Calculate delivery rate
    const totalMessages = messageLogs.length;
    const deliveredMessages = messageLogs.filter(log => log.status === 'delivered').length;
    const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;

    // Update campaign analytics
    const { error: updateError } = await supabaseClient
      .from('campaign_analytics')
      .upsert({
        campaign_id: campaignId,
        delivery_rate: deliveryRate,
        updated_at: new Date().toISOString()
      })

    if (updateError) {
      console.error('Error updating campaign analytics:', updateError);
      throw updateError;
    }

    console.log('Successfully updated campaign analytics');
  } catch (error) {
    console.error('Error in updateCampaignAnalytics:', error);
    throw error;
  }
}