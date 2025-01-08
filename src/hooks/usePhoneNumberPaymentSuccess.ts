import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function usePhoneNumberPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (sessionId) {
        try {
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

          // Show success message
          toast({
            title: "Payment Successful!",
            description: "Your new phone number is on its way!",
          });

          // Invalidate phone numbers query to trigger a refresh
          queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });

          // Navigate to phone numbers tab
          navigate("/dashboard?tab=phone-numbers");
        } catch (error) {
          console.error('Error processing payment success:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "There was a problem processing your payment success. Please contact support.",
          });
        }
      }
    };

    handlePaymentSuccess();
  }, [searchParams, toast, navigate, queryClient]);
}