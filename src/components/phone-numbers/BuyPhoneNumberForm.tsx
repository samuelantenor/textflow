import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const BuyPhoneNumberForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!country) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a country",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get the current user's email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.email) throw new Error('User email not found');

      // Create phone number request
      const { error: requestError } = await supabase
        .from('phone_number_requests')
        .insert({
          user_id: user.id,
          email: user.email,
          region: country,
        });

      if (requestError) throw requestError;

      // Create checkout session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'create-phone-number-checkout',
        {
          method: 'POST',
          body: { country },
        }
      );

      if (sessionError) throw sessionError;
      if (!sessionData?.url) throw new Error('No checkout URL received');

      // Redirect to Stripe Checkout
      window.location.href = sessionData.url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to start checkout process",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Choose Region Number</Label>
        <PhoneInput
          country={"us"}
          enableSearch
          disableSearchIcon
          inputProps={{
            required: true,
          }}
          onChange={(value) => setCountry(value)}
          containerClass="!w-full"
          inputClass="!w-full !h-10 !text-base"
          buttonClass="!h-10"
          searchClass="!w-full"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Monthly fee: $5/month
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};