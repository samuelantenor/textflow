
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendWelcomeMessageRequest {
  phoneNumber: string;
  formId: string;
  language?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, formId, language = 'en' } = await req.json() as SendWelcomeMessageRequest;

    // Initialize Twilio client
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get form details including welcome message template
    const { data: form, error: formError } = await supabaseClient
      .from('custom_forms')
      .select('title, welcome_message_template')
      .eq('id', formId)
      .single();

    if (formError) {
      console.error('Error fetching form:', formError);
      throw formError;
    }

    // Prepare welcome message based on template and language
    let message;
    if (form.welcome_message_template && form.welcome_message_template[language]) {
      message = form.welcome_message_template[language].replace('{title}', form.title);
    } else {
      // Fallback to default message if no template is set
      message = language === 'fr' 
        ? `Merci d'avoir soumis le formulaire "${form.title}". Nous avons bien reçu votre réponse et nous vous contacterons bientôt.`
        : `Thank you for submitting the form "${form.title}". We have received your response and will be in touch soon.`;
    }

    console.log('Sending welcome SMS to:', phoneNumber);
    console.log('Message:', message);

    // Send message via Twilio
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: '+15146125967', // Using your Twilio phone number
          Body: message,
        }),
      }
    );

    const messageData = await twilioResponse.json();
    console.log('Twilio response:', messageData);

    if (!twilioResponse.ok) {
      throw new Error(`Twilio error: ${messageData.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: messageData.sid }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in send-welcome-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
