import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  plan_type: string;
  monthly_message_limit: number;
  campaign_limit: number;
  has_been_paid: boolean;
}

interface BillingOverviewProps {
  subscription?: Subscription | null;
}

export const BillingOverview = ({ subscription }: BillingOverviewProps) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/pricing');
  };

  const isFreePlan = subscription?.plan_type === 'free';

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Subscription Overview</h2>
      
      {subscription && !isFreePlan ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium capitalize">{subscription.plan_type}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{subscription.status}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Monthly Message Limit</span>
            <span className="font-medium">{subscription.monthly_message_limit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Campaign Limit</span>
            <span className="font-medium">{subscription.campaign_limit}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-muted-foreground text-center">
            Upgrade to our paid plan to unlock unlimited campaigns and increased message limits!
          </p>
          <Button 
            onClick={handleSubscribe}
            className="bg-primary hover:bg-primary/90 w-full"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Subscribe Now
          </Button>
        </div>
      )}
    </div>
  );
};