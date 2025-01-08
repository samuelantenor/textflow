import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BillingOverview = () => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    navigate('/pricing');
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Subscription Overview</h2>
      <div className="flex justify-end">
        <Button 
          onClick={handleSubscribe}
          className="bg-primary hover:bg-primary/90"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Subscribe Now
        </Button>
      </div>
    </div>
  );
};