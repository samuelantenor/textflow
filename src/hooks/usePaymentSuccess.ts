import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function usePaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      toast({
        title: "Payment Successful!",
        description: "Your new phone number is on its way. We'll notify you once it's ready.",
      });
    }
  }, [searchParams, toast]);
}