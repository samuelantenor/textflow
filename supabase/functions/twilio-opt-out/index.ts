
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to normalize phone numbers by removing "+" prefix
const normalizePhoneNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/^\+/, '');
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
    
    console.log(`Processing message from ${fromNumber} with content: ${messageBody}`);

    // Check if the message contains our custom exit keyword
    const isExit = messageBody.trim() === 'exit';

    if (!isExit) {
      console.log('Not an exit message, letting Twilio handle any opt-out keywords');
      return new Response(JSON.stringify({ success: true, message: 'Not an exit request' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Normalize the incoming phone number
    const normalizedFromNumber = normalizePhoneNumber(fromNumber);
    console.log('Searching for normalized phone number:', normalizedFromNumber);

    // Find all contacts with this phone number and their associated groups
    const { data: contactsWithGroups, error: contactsError } = await supabaseClient
      .from('contacts')
      .select(`
        id,
        group_id,
        phone_number,
        campaign_groups!inner (
          user_id,
          name
        )
      `)
      .filter('phone_number', 'ilike', `%${normalizedFromNumber}`);

    if (contactsError) {
      console.error('Error finding contacts:', contactsError);
      throw contactsError;
    }

    console.log('Found contacts:', contactsWithGroups);

    if (!contactsWithGroups || contactsWithGroups.length === 0) {
      console.log('No contacts found for this number');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No contacts found for this number'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Group contacts by user_id for logging purposes
    const userGroups = contactsWithGroups.reduce((acc, contact) => {
      const userId = contact.campaign_groups.user_id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(contact);
      return acc;
    }, {});

    // Delete contacts and log for each user
    for (const [userId, contacts] of Object.entries(userGroups)) {
      // Delete all contacts for this user
      const contactIds = contacts.map(c => c.id);
      const { error: deleteError } = await supabaseClient
        .from('contacts')
        .delete()
        .in('id', contactIds);

      if (deleteError) {
        console.error(`Error deleting contacts for user ${userId}:`, deleteError);
        throw deleteError;
      }

      console.log(`Successfully removed ${fromNumber} from ${contacts.length} groups for user ${userId}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact successfully removed from groups',
      removedFromGroups: contactsWithGroups.length,
      details: `Removed from ${contactsWithGroups.length} groups across ${Object.keys(userGroups).length} users`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing exit request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
