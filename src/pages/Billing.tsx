import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { UsageStats } from "@/components/billing/UsageStats";
import { PaymentHistory } from "@/components/billing/PaymentHistory";
import { Toaster } from "@/components/ui/toaster";

const Billing = () => {
  const navigate = useNavigate();

  // Check authentication and session
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
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Billing & Subscription</h1>
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