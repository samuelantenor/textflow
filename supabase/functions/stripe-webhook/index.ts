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
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(event.data.object);
        break;
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