import { Button } from "@/components/ui/button";
import { CreditCard, Settings } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const BillingOverview = ({ subscription }: { subscription: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          method: 'POST',
        }
      );

      if (sessionError) throw sessionError;
      if (!sessionData?.url) throw new Error('No checkout URL received');

      window.location.href = sessionData.url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to start checkout process",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'create-portal-session',
        {
          method: 'POST',
        }
      );

      if (sessionError) throw sessionError;
      if (!sessionData?.url) throw new Error('No portal URL received');

      window.location.href = sessionData.url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to open subscription management",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSubscribed = subscription?.status === 'active';

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Subscription Overview</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Plan</p>
            <p className="text-muted-foreground">
              {isSubscribed ? 'Premium Plan' : 'Free Plan'}
            </p>
          </div>
          {isSubscribed ? (
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          ) : (
            <Button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe Now
            </Button>
          )}
        </div>
        <div>
          <p className="font-medium">Status</p>
          <p className="text-muted-foreground capitalize">
            {subscription?.status || 'Not subscribed'}
          </p>
        </div>
        {!isSubscribed && (
          <div className="pt-4">
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};