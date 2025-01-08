import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function usePaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (sessionId) {
        try {
          // Get current user
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) throw new Error('No user found');

          // Update subscription status
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              plan_type: 'paid',
              monthly_message_limit: 1000,
              campaign_limit: 999999,
              has_been_paid: true
            })
            .eq('user_id', session.user.id);

          if (updateError) throw updateError;

          toast({
            title: "Subscription Activated!",
            description: "Your account has been upgraded to paid status. Enjoy the full features!",
          });

          // Redirect to dashboard
          navigate("/dashboard");
        } catch (error) {
          console.error('Error updating subscription:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update subscription status. Please contact support.",
          });
        }
      }
    };

    handlePaymentSuccess();
  }, [searchParams, toast, navigate]);
}