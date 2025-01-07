import { CreditCard } from "lucide-react";
import { useEffect } from "react";

export const BillingOverview = ({ subscription }: { subscription: any }) => {
  useEffect(() => {
    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Subscription Overview</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Plan</p>
            <p className="text-muted-foreground">
              {subscription?.status === 'active' ? 'Premium Plan' : 'Free Plan'}
            </p>
          </div>
          {subscription?.status !== 'active' && (
            <stripe-buy-button
              buy-button-id="buy_btn_1QeVcgB4RWKZ2dNza9CFKIwx"
              publishable-key="pk_test_51QL67PB4RWKZ2dNzsxovpn7D6fAiFm6cj7aH3TDwv1HmrQgAh4CJUpBZJdKqLWPj9uNHsj3j4IgLrynaKEqbp95n00KL67n19K"
            />
          )}
        </div>
        <div>
          <p className="font-medium">Status</p>
          <p className="text-muted-foreground capitalize">{subscription?.status || 'Not subscribed'}</p>
        </div>
      </div>
    </div>
  );
};