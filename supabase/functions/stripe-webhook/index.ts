import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  
  try {
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Session data:', session);
        
        if (!session.client_reference_id) {
          throw new Error('No client_reference_id found in session');
        }

        // Handle regular subscription
        if (session.mode === 'subscription' && !session.metadata?.isPhoneNumber) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          console.log('Subscription data:', subscription);

          // Fetch the product details to get the name
          const product = await stripe.products.retrieve('prod_RWkBT7Yqvn0DkE');
          console.log('Product data:', product);

          const { error } = await supabaseClient
            .from('subscriptions')
            .insert({
              user_id: session.client_reference_id,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan_name: product.name
            });

          if (error) {
            console.error('Error inserting subscription:', error);
            throw error;
          }
          
          console.log('Successfully recorded subscription in database');
        }
        
        // Handle phone number request
        if (session.mode === 'subscription' && session.metadata?.isPhoneNumber) {
          console.log('Processing phone number request');
          
          // Get the phone number request details
          const { data: requestData, error: requestError } = await supabaseClient
            .from('phone_number_requests')
            .select('*')
            .eq('user_id', session.client_reference_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (requestError) {
            console.error('Error fetching phone number request:', requestError);
            throw requestError;
          }

          // Send data to Formspree
          const formspreeResponse = await fetch('https://formspree.io/f/mnnnowqq', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: requestData.email,
              region: requestData.region,
              message: `New phone number request:\nEmail: ${requestData.email}\nRegion: ${requestData.region}`,
            }),
          });

          if (!formspreeResponse.ok) {
            console.error('Error sending to Formspree:', await formspreeResponse.text());
            throw new Error('Failed to send notification');
          }

          console.log('Successfully sent notification to Formspree');
          
          // Update request status
          const { error: updateError } = await supabaseClient
            .from('phone_number_requests')
            .update({ status: 'paid' })
            .eq('id', requestData.id);

          if (updateError) {
            console.error('Error updating request status:', updateError);
            throw updateError;
          }
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Updating subscription status:', subscription.id, subscription.status);
        
        // Fetch the product details to get the name for updates
        const product = await stripe.products.retrieve('prod_RWkBT7Yqvn0DkE');
        
        const { error } = await supabaseClient
          .from('subscriptions')
          .update({ 
            status: subscription.status,
            plan_name: product.name 
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }
        
        console.log('Successfully updated subscription status in database');
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});