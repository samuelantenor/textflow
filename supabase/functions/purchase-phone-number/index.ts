import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Twilio } from "npm:twilio";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { phoneNumber } = await req.json();
    const authHeader = req.headers.get('Authorization')?.split(' ')[1];
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) throw new Error('Unauthorized');

    const client = new Twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID'),
      Deno.env.get('TWILIO_AUTH_TOKEN')
    );

    // Purchase the number from Twilio
    const purchasedNumber = await client.incomingPhoneNumbers
      .create({ phoneNumber });

    // Store the number in our database
    const { error: dbError } = await supabase
      .from('phone_numbers')
      .insert({
        user_id: user.id,
        phone_number: purchasedNumber.phoneNumber,
        friendly_name: purchasedNumber.friendlyName,
        capabilities: [
          ...(purchasedNumber.capabilities.sms ? ['SMS'] : []),
          ...(purchasedNumber.capabilities.voice ? ['Voice'] : []),
        ],
        twilio_sid: purchasedNumber.sid,
        monthly_cost: parseFloat(purchasedNumber.pricePerMonth),
      });

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});