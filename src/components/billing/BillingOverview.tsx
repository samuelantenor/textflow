import { Button } from "@/components/ui/button";
import { CreditCard, Settings, ArrowUpCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Define the subscription type
type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: string;
  plan_type: string;
  monthly_message_limit: number;
  campaign_limit: number;
  has_been_paid: boolean;
  created_at: string;
  updated_at: string;
}

// Define the component props
interface BillingOverviewProps {
  subscription?: Subscription | null;
}

export const BillingOverview = ({ subscription }: BillingOverviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/pricing');
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

  // Check if the user has a paid subscription based on monthly_message_limit
  const isSubscribed = subscription?.status === 'active' && 
    (subscription?.plan_type === 'paid' || subscription?.monthly_message_limit === 1000);

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
              variant="outline"
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
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              size="lg"
            >
              <ArrowUpCircle className="mr-2 h-5 w-5" />
              Upgrade to Premium
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};