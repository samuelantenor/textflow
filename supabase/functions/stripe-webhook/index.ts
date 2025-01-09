import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "./stripe-client.ts";
import { 
  handleSubscriptionDeleted, 
  handleCheckoutCompleted, 
  handleSubscriptionUpdated 
} from "./handlers/subscription-handlers.ts";

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
    console.log('Received webhook request');
    
    if (!signature) {
      console.error('No Stripe signature found');
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    console.log('Request body:', body);
    
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      throw new Error('Webhook secret not configured');
    }

    console.log('Constructing Stripe event...');
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Processing webhook event:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2));

    switch (event.type) {
      case 'customer.subscription.deleted':
        console.log('Handling subscription deletion...');
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'checkout.session.completed':
        console.log('Handling checkout completion...');
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        console.log('Handling subscription update...');
        await handleSubscriptionUpdated(event.data.object);
        break;
    }

    console.log('Successfully processed webhook event');
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Error processing webhook:', err);
    console.error('Error details:', err.stack);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});