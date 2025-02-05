
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    console.log('Authenticating user...');
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed');
    }

    const email = user.email;
    if (!email) {
      throw new Error('No email found');
    }

    // Parse request body ONCE at the start
    const { priceId } = await req.json();
    console.log('Received price ID:', priceId);

    // Validate price ID and determine plan type
    const validPriceIds = {
      'price_1QhissB4RWKZ2dNzqP59PjSe': 'starter',
      'price_1Qp2e8B4RWKZ2dNzE3i3i37m': 'professional'
    };

    const requestedPlanType = validPriceIds[priceId];
    if (!requestedPlanType) {
      throw new Error('Invalid price ID');
    }

    // Check current subscription plan type
    const { data: subscriptionData, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) throw subError;

    // Only block if subscription exists and trying to subscribe to the same plan type
    if (subscriptionData?.plan_type === requestedPlanType) {
      throw new Error(`You are already subscribed to the ${requestedPlanType} plan`);
    }

    console.log('Creating Stripe instance...');
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Checking existing customers...');
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customer_id;
    if (customers.data.length > 0) {
      customer_id = customers.data[0].id;
      console.log('Found existing customer:', customer_id);
    } else {
      console.log('Creating new customer...');
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customer_id = customer.id;
    }

    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/`,
    });

    console.log('Checkout session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
