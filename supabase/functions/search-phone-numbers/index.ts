import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Twilio } from "npm:twilio";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error('Missing Twilio credentials');
    }

    const client = new Twilio(accountSid, authToken);

    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      console.log('No request body or invalid JSON');
    }

    const { areaCode, pattern, capabilities = { sms: true, voice: true } } = body;

    console.log('Request body:', { areaCode, pattern, capabilities });

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

    console.log('Searching with params:', searchParams);

    const numbers = await client.availablePhoneNumbers('US')
      .local
      .list(searchParams);

    console.log(`Found ${numbers.length} numbers`);

    const formattedNumbers = numbers.map(number => ({
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
      capabilities: [
        ...(number.capabilities.SMS ? ['SMS'] : []),
        ...(number.capabilities.voice ? ['Voice'] : []),
      ],
      monthlyCost: parseFloat(number.pricePerMonth),
    }));

    return new Response(
      JSON.stringify(formattedNumbers),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  }
});