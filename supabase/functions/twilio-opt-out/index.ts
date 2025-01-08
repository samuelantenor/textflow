import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Received opt-out webhook request:', req.method);

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
    
    const messageBody = formData.get('Body')?.toString().toLowerCase() || '';
    const fromNumber = formData.get('From')?.toString() || '';
    
    if (!messageBody || !fromNumber) {
      console.error('Missing required fields:', { messageBody, fromNumber });
      throw new Error('Missing required fields: Body or From');
    }
    
    console.log(`Processing opt-out request from ${fromNumber} with message: ${messageBody}`);

    // Check if the message contains opt-out keywords
    const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
    const isOptOut = optOutKeywords.some(keyword => messageBody.includes(keyword));

    if (!isOptOut) {
      console.log('Not an opt-out message, ignoring');
      return new Response(JSON.stringify({ success: true, message: 'Not an opt-out request' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find all groups containing this contact
    const { data: contacts, error: contactsError } = await supabaseClient
      .from('contacts')
      .select('id, group_id')
      .eq('phone_number', fromNumber);

    if (contactsError) {
      console.error('Error finding contacts:', contactsError);
      throw contactsError;
    }

    console.log('Found contacts:', contacts);

    // Delete the contact from all groups
    for (const contact of contacts) {
      const { error: deleteError } = await supabaseClient
        .from('contacts')
        .delete()
        .eq('id', contact.id);

      if (deleteError) {
        console.error('Error deleting contact:', deleteError);
        throw deleteError;
      }
    }

    console.log(`Successfully removed ${fromNumber} from ${contacts.length} groups`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact successfully opted out',
      removedFromGroups: contacts.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing opt-out webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})