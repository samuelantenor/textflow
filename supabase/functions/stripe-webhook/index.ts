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

        // Handle subscription
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          console.log('Subscription data:', subscription);

          // Update subscription in database
          const { error: updateError } = await supabaseClient
            .from('subscriptions')
            .upsert({
              user_id: session.client_reference_id,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan_type: 'paid',
              monthly_message_limit: 1000,
              campaign_limit: 999999,
              has_been_paid: true
            });

          if (updateError) {
            console.error('Error updating subscription:', updateError);
            throw updateError;
          }

          // Add payment history record
          const { error: paymentError } = await supabaseClient
            .from('payment_history')
            .insert({
              user_id: session.client_reference_id,
              amount: session.amount_total ? session.amount_total / 100 : 0,
              currency: session.currency?.toUpperCase() || 'USD',
              status: 'completed',
              payment_method: session.payment_method_types?.[0] || null
            });

          if (paymentError) {
            console.error('Error recording payment:', paymentError);
            throw paymentError;
          }
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Updating subscription status:', subscription.id, subscription.status);
        
        // Find the user_id from the subscription
        const { data: subscriptionData, error: findError } = await supabaseClient
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (findError || !subscriptionData) {
          console.error('Error finding subscription:', findError);
          throw findError || new Error('Subscription not found');
        }

        // Update subscription status
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({ 
            status: subscription.status,
            plan_type: subscription.status === 'active' ? 'paid' : 'free',
            monthly_message_limit: subscription.status === 'active' ? 1000 : 20,
            campaign_limit: subscription.status === 'active' ? 999999 : 3,
            has_been_paid: subscription.status === 'active'
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          throw updateError;
        }
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