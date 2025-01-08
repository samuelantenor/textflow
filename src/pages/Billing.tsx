import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentHistory } from "@/components/billing/PaymentHistory";
import { UsageStats } from "@/components/billing/UsageStats";
import { CreditCard } from "lucide-react";

const Billing = () => {
  const navigate = useNavigate();

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleSubscribeClick = () => {
    navigate('/pricing');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        <Button 
          onClick={handleSubscribeClick}
          className="bg-primary hover:bg-primary/90"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Subscribe Now
        </Button>
      </div>

      <div className="grid gap-8">
        <UsageStats />
        <PaymentHistory />
      </div>
    </div>
  );
};

export default Billing;