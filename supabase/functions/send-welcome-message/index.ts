
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
      .select('title, welcome_message_template, group_id')
      .eq('id', formId)
      .single();

    if (formError) {
      console.error('Error fetching form:', formError);
      throw formError;
    }

    // Check welcome offer eligibility
    const { data: isEligible, error: eligibilityError } = await supabaseClient
      .rpc('check_welcome_offer_eligibility', {
        p_phone_number: phoneNumber,
        p_group_id: form.group_id,
        p_cooldown_days: 90 // 90 days cooldown period
      });

    if (eligibilityError) {
      console.error('Error checking eligibility:', eligibilityError);
      throw eligibilityError;
    }

    // Prepare welcome message based on template and eligibility
    let message;
    if (form.welcome_message_template && form.welcome_message_template[language]) {
      if (isEligible) {
        message = form.welcome_message_template[language].replace('{title}', form.title);
      } else {
        // Use a different message for returning customers
        message = language === 'fr' 
          ? `Ravi de vous revoir ! Vous êtes maintenant réinscrit à "${form.title}".`
          : `Welcome back! You're now subscribed again to "${form.title}".`;
      }
    } else {
      // Fallback messages
      if (isEligible) {
        message = language === 'fr' 
          ? `Merci d'avoir soumis le formulaire "${form.title}". Nous avons bien reçu votre réponse et nous vous contacterons bientôt.`
          : `Thank you for submitting the form "${form.title}". We have received your response and will be in touch soon.`;
      } else {
        message = language === 'fr' 
          ? `Ravi de vous revoir ! Vous êtes maintenant réinscrit à "${form.title}".`
          : `Welcome back! You're now subscribed again to "${form.title}".`;
      }
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

    // If eligible, update contact_history to mark welcome offer as sent
    if (isEligible) {
      const { error: historyError } = await supabaseClient
        .from('contact_history')
        .update({ welcome_offer_sent: true })
        .eq('group_id', form.group_id)
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(1);

      if (historyError) {
        console.error('Error updating contact history:', historyError);
        // Don't throw here, we still want to return success for the message send
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: messageData.sid,
        welcomeOfferSent: isEligible 
      }),
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
