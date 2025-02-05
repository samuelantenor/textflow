import { stripe } from '../stripe-client.ts';
import { supabaseClient } from '../supabase-client.ts';

export async function handleSubscriptionDeleted(subscription: any) {
  console.log('Processing subscription cancellation:', subscription.id);
  
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

  const userId = subscriptionData.user_id;
  console.log('Found user ID:', userId);

  // Update subscription status
  const { error: updateError } = await supabaseClient
    .from('subscriptions')
    .update({ 
      status: 'canceled',
      plan_type: 'free',
      monthly_message_limit: 20,
      campaign_limit: 3,
      has_been_paid: false,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    throw updateError;
  }

  // Add cancellation record to payment history
  const { error: paymentHistoryError } = await supabaseClient
    .from('payment_history')
    .insert({
      user_id: userId,
      amount: 0,
      status: 'subscription_cancelled',
      payment_method: 'stripe',
      payment_date: new Date().toISOString()
    });

  if (paymentHistoryError) {
    console.error('Error recording payment history:', paymentHistoryError);
    throw paymentHistoryError;
  }

  console.log('Successfully processed subscription cancellation for user:', userId);
}

export async function handleCheckoutCompleted(session: any) {
  console.log('Processing checkout session:', session.id);
  console.log('Session data:', JSON.stringify(session, null, 2));
  
  if (!session.client_reference_id) {
    throw new Error('No client_reference_id found in session');
  }

  if (session.mode === 'subscription') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log('Retrieved subscription data:', JSON.stringify(subscription, null, 2));

    // Update subscription in database with 10,000 message limit for professional plan
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: session.client_reference_id,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        plan_type: 'paid',
        monthly_message_limit: 10000, // Updated to 10,000 messages
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

    console.log('Successfully processed checkout session');
  }
}

export async function handleSubscriptionUpdated(subscription: any) {
  console.log('Processing subscription update:', subscription.id);
  console.log('Subscription data:', JSON.stringify(subscription, null, 2));
  
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

  // Update subscription status with 10,000 message limit for active paid plans
  const { error: updateError } = await supabaseClient
    .from('subscriptions')
    .update({ 
      status: subscription.status,
      plan_type: subscription.status === 'active' ? 'paid' : 'free',
      monthly_message_limit: subscription.status === 'active' ? 10000 : 20, // Updated to 10,000 messages
      campaign_limit: subscription.status === 'active' ? 999999 : 3,
      has_been_paid: subscription.status === 'active'
    })
    .eq('stripe_subscription_id', subscription.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    throw updateError;
  }

  console.log('Successfully processed subscription update');
}