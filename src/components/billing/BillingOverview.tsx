import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
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
          <Button 
            onClick={handleSubscribe}
            disabled={subscription?.status === 'active' || isLoading}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {subscription?.status === 'active' ? 'Subscribed' : 'Subscribe Now'}
          </Button>
        </div>
        <div>
          <p className="font-medium">Status</p>
          <p className="text-muted-foreground capitalize">{subscription?.status || 'Not subscribed'}</p>
        </div>
      </div>
    </div>
  );
};