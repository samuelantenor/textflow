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

    // Find the message log entry
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

    console.log('Found message log:', messageLog);

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
    const { data: analytics, error: analyticsError } = await supabaseClient
      .from('campaign_analytics')
      .select('*')
      .eq('campaign_id', messageLog.campaign_id)
      .single()

    if (analyticsError && analyticsError.code !== 'PGRST116') { // Not found error
      console.error('Error fetching campaign analytics:', analyticsError);
      throw analyticsError
    }

    // Calculate new metrics
    const { data: allMessages, error: messagesError } = await supabaseClient
      .from('message_logs')
      .select('status')
      .eq('campaign_id', messageLog.campaign_id)

    if (messagesError) {
      console.error('Error fetching all messages:', messagesError);
      throw messagesError
    }

    console.log('All messages for campaign:', allMessages);

    const totalMessages = allMessages.length
    const deliveredMessages = allMessages.filter(msg => msg.status === 'delivered').length
    const deliveryRate = (deliveredMessages / totalMessages) * 100

    console.log('Calculated metrics:', {
      totalMessages,
      deliveredMessages,
      deliveryRate
    });

    // Update or insert analytics
    const analyticsData = {
      campaign_id: messageLog.campaign_id,
      delivery_rate: deliveryRate,
      updated_at: new Date().toISOString()
    }

    if (analytics) {
      const { error: updateAnalyticsError } = await supabaseClient
        .from('campaign_analytics')
        .update(analyticsData)
        .eq('campaign_id', messageLog.campaign_id)

      if (updateAnalyticsError) {
        console.error('Error updating analytics:', updateAnalyticsError);
        throw updateAnalyticsError
      }
    } else {
      const { error: insertAnalyticsError } = await supabaseClient
        .from('campaign_analytics')
        .insert([{
          ...analyticsData,
          open_rate: 0,
          click_rate: 0,
          cost: 0,
          revenue: 0
        }])

      if (insertAnalyticsError) {
        console.error('Error inserting analytics:', insertAnalyticsError);
        throw insertAnalyticsError
      }
    }

    console.log('Successfully updated campaign analytics');

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