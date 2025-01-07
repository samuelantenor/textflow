import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const BillingOverview = ({ subscription }: { subscription: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
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

  const handleUnsubscribe = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? This will take effect at the end of your current billing period.')) {
      return;
    }

    try {
      setIsCancelling(true);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      const { error } = await supabase.functions.invoke(
        'cancel-subscription',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will end at the end of the current billing period.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to cancel subscription",
      });
    } finally {
      setIsCancelling(false);
    }
  };

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
          {subscription?.status === 'active' ? (
            <Button 
              variant="destructive"
              onClick={handleUnsubscribe}
              disabled={isCancelling}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          ) : (
            <Button 
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe Now
            </Button>
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