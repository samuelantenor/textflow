import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Map of region codes to country names (only for shared region codes)
const regionToCountry: Record<string, string> = {
  US: "United States (+1)",
  CA: "Canada (+1)",
};

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
          // Get user session to retrieve email
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user?.email) throw new Error('User email not found');

          // Get the phone number request to retrieve region
          const { data: requests, error: requestError } = await supabase
            .from('phone_number_requests')
            .select('region')
            .eq('email', session.user.email)
            .order('created_at', { ascending: false })
            .limit(1);

          if (requestError) throw requestError;
          const regionCode = requests?.[0]?.region || 'Unknown region';
          const countryName = regionToCountry[regionCode] || regionCode;

          // Send notification via Formspree
          await fetch("https://formspree.io/f/mnnnowqq", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: session.user.email,
              region: regionCode,
              country: countryName,
              message: `New phone number request:\nEmail: ${session.user.email}\nRegion: ${regionCode}\nCountry: ${countryName}`,
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