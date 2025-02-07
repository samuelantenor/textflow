
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
    const toNumber = formData.get('To')?.toString() || '';
    
    if (!messageBody || !fromNumber || !toNumber) {
      console.error('Missing required fields:', { messageBody, fromNumber, toNumber });
      throw new Error('Missing required fields: Body, From, or To');
    }
    
    console.log(`Processing opt-out request from ${fromNumber} to ${toNumber} with message: ${messageBody}`);

    // Check if the message contains opt-out keywords
    const optOutKeywords = ['exit'];
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

    // Normalize phone numbers
    const normalizedFromNumber = normalizePhoneNumber(fromNumber);
    const normalizedToNumber = normalizePhoneNumber(toNumber);
    
    // First, identify the business by looking up the 'To' number
    console.log('Looking up business phone number:', normalizedToNumber);
    const { data: phoneNumberData, error: phoneNumberError } = await supabaseClient
      .from('phone_numbers')
      .select('user_id')
      .eq('phone_number', normalizedToNumber)
      .maybeSingle();

    if (phoneNumberError) {
      console.error('Error finding business phone number:', phoneNumberError);
      throw phoneNumberError;
    }

    if (!phoneNumberData) {
      console.error('Business phone number not found:', normalizedToNumber);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Business phone number not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const businessUserId = phoneNumberData.user_id;
    console.log('Found business user_id:', businessUserId);

    // Find contacts belonging to this business's groups
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
      .eq('phone_number', normalizedFromNumber)
      .eq('campaign_groups.user_id', businessUserId);

    if (contactsError) {
      console.error('Error finding contacts:', contactsError);
      throw contactsError;
    }

    console.log('Found contacts for this business:', contactsWithGroups);

    if (!contactsWithGroups || contactsWithGroups.length === 0) {
      console.log('No contacts found for this number in business groups');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No contacts found for this number in business groups'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Process opt-out for each contact using a transaction
    const { error: transactionError } = await supabaseClient.rpc('begin');
    if (transactionError) throw transactionError;

    try {
      // First insert contact history records
      for (const contact of contactsWithGroups) {
        const { error: historyError } = await supabaseClient
          .from('contact_history')
          .insert({
            contact_id: contact.id,
            phone_number: normalizedFromNumber,
            group_id: contact.group_id,
            event_type: 'leave',
            metadata: {
              reason: 'opt_out',
              message: messageBody,
              business_phone: normalizedToNumber
            }
          });

        if (historyError) {
          console.error(`Error creating history for contact ${contact.id}:`, historyError);
          throw historyError;
        }
      }

      // Then delete the contacts
      for (const contact of contactsWithGroups) {
        const { error: deleteError } = await supabaseClient
          .from('contacts')
          .delete()
          .eq('id', contact.id);

        if (deleteError) {
          console.error(`Error deleting contact ${contact.id}:`, deleteError);
          throw deleteError;
        }

        console.log(`Successfully removed ${normalizedFromNumber} from group ${contact.group_id}`);
      }

      await supabaseClient.rpc('commit');
    } catch (error) {
      console.error('Error in transaction, rolling back:', error);
      await supabaseClient.rpc('rollback');
      throw error;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact successfully opted out',
      removedFromGroups: contactsWithGroups.length,
      details: `Removed from ${contactsWithGroups.length} groups owned by this business`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing opt-out webhook:', error);
    // Try to rollback if there was an error during transaction
    try {
      await createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      ).rpc('rollback');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
