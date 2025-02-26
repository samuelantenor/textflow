
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { UsageStats } from "@/components/billing/UsageStats";
import { PaymentHistory } from "@/components/billing/PaymentHistory";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const Billing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        navigate("/login", { replace: true });
        return;
      }
      
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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

  return (
    <>
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Billing & Subscription</h1>
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              variant="outline"
              className="bg-black/20"
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </div>

          <div className="space-y-6">
            <BillingOverview />
            <UsageStats />
            <PaymentHistory />
          </div>
        </main>
      </div>
      <Toaster />
    </>
  );
};

export default Billing;
