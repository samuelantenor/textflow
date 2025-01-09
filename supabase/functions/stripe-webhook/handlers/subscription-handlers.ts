import { stripe } from '../stripe-client.ts';
import { supabaseClient } from '../supabase-client.ts';

export async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription cancelled:', subscription.id);
  
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
  console.log('Session data:', session);
  
  if (!session.client_reference_id) {
    throw new Error('No client_reference_id found in session');
  }

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
}

export async function handleSubscriptionUpdated(subscription: any) {
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
}