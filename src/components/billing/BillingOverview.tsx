import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";
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

  // Check if the user has a paid subscription based on status
  const isSubscribed = subscription?.status === 'active';
  
  // Add console log to debug subscription status
  console.log('Current subscription status:', subscription?.status);

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Subscription Overview</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle 
            className={`h-4 w-4 ${isSubscribed ? 'text-green-500 fill-green-500' : 'text-red-500 fill-red-500'}`}
          />
          <span className="text-muted-foreground">
            {isSubscribed ? 'Active' : 'Inactive'}
          </span>
        </div>
        {isSubscribed ? (
          <Button 
            onClick={handleManageSubscription}
            disabled={isLoading}
            variant="outline"
          >
            Manage Subscription
          </Button>
        ) : (
          <Button 
            onClick={handleSubscribe}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            Subscribe
          </Button>
        )}
      </div>
    </div>
  );
};