
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
      .select('*, campaigns (user_id)')  // Include campaign's user_id
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

    // Get user_id from the campaign
    const userId = messageLog.campaigns?.user_id;
    if (!userId) {
      console.error('User ID not found for message:', messageSid);
      throw new Error('User ID not found');
    }

    // Update message status and increment appropriate counter
    if (messageStatus === 'delivered') {
      console.log('Message delivered, incrementing delivered count for user:', userId);
      
      const { error: incrementError } = await supabaseClient.rpc(
        'increment_delivered_message_count',
        { user_id_param: userId }
      );

      if (incrementError) {
        console.error('Error incrementing delivered count:', incrementError);
        throw incrementError;
      }
    } else if (messageStatus === 'failed' || messageStatus === 'undelivered') {
      console.log('Message failed, incrementing failed count for user:', userId);
      
      const { error: incrementError } = await supabaseClient.rpc(
        'increment_failed_message_count',
        { user_id_param: userId }
      );

      if (incrementError) {
        console.error('Error incrementing failed count:', incrementError);
        throw incrementError;
      }
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
    const { error: analyticsError } = await supabaseClient.rpc('update_campaign_analytics');

    if (analyticsError) {
      console.error('Error updating campaign analytics:', analyticsError);
      throw analyticsError;
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
