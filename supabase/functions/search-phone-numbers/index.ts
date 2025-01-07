import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { areaCode, pattern, capabilities } = await req.json();

    const client = new Twilio(
      Deno.env.get('TWILIO_ACCOUNT_SID'),
      Deno.env.get('TWILIO_AUTH_TOKEN')
    );

    const searchParams: any = {
      limit: 20,
      country: 'US',
    };

    if (areaCode) {
      searchParams.areaCode = areaCode;
    }

    if (pattern) {
      searchParams.contains = pattern;
    }

    if (capabilities) {
      if (capabilities.sms && !capabilities.voice) {
        searchParams.smsEnabled = true;
      } else if (capabilities.voice && !capabilities.sms) {
        searchParams.voiceEnabled = true;
      } else if (capabilities.sms && capabilities.voice) {
        searchParams.smsEnabled = true;
        searchParams.voiceEnabled = true;
      }
    }

    const numbers = await client.availablePhoneNumbers('US')
      .local
      .list(searchParams);

    const formattedNumbers = numbers.map(number => ({
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
      capabilities: [
        ...(number.capabilities.sms ? ['SMS'] : []),
        ...(number.capabilities.voice ? ['Voice'] : []),
      ],
      monthlyCost: parseFloat(number.pricePerMonth),
    }));

    return new Response(
      JSON.stringify(formattedNumbers),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});