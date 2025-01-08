import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function usePaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (sessionId) {
        try {
          // Show success message
          toast({
            title: "Payment Successful!",
            description: "Your new phone number is on its way!",
          });

          // Send notification via Formspree
          await fetch("https://formspree.io/f/mnnnowqq", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "New phone number purchase",
              sessionId: sessionId,
            }),
          });

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
          queryClient.invalidateQueries({ queryKey: ['subscription'] });

          // Redirect to phone numbers tab
          navigate("/dashboard?tab=phone-numbers");
        } catch (error) {
          console.error('Error in payment success handler:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "There was a problem processing your request. Please contact support.",
          });
        }
      }
    };

    handlePaymentSuccess();
  }, [searchParams, toast, navigate, queryClient]);
}