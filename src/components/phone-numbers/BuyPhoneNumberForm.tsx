import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export const BuyPhoneNumberForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const { toast } = useToast();

  // Check if user can buy phone numbers
  const { data: planLimits } = useQuery({
    queryKey: ['user-plan-limits'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase.rpc('get_user_plan_limits', {
        user_id: session.user.id
      });

      if (error) throw error;
      return data[0];
    }
  });

  const canBuyPhoneNumbers = planLimits?.can_buy_phone_numbers ?? false;

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

    if (!canBuyPhoneNumbers) {
      toast({
        variant: "destructive",
        title: "Subscription Required",
        description: "Please upgrade to a paid plan to buy phone numbers.",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user?.email) throw new Error('User email not found');

      const { error: requestError } = await supabase
        .from('phone_number_requests')
        .insert({
          user_id: user.id,
          email: user.email,
          region: country,
        });

      if (requestError) throw requestError;

      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'create-phone-number-checkout',
        {
          method: 'POST',
          body: { country },
        }
      );

      if (sessionError) throw sessionError;
      if (!sessionData?.url) throw new Error('No checkout URL received');

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
          inputClass="!w-full !h-10 !text-base !text-black"
          buttonClass="!h-10"
          searchClass="!w-full !text-black"
          dropdownClass="!text-black"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Monthly fee: $5/month
        </p>
        {!canBuyPhoneNumbers && (
          <p className="text-sm text-yellow-600">
            Upgrade to a paid plan to buy phone numbers
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !canBuyPhoneNumbers}
      >
        {isLoading ? "Processing..." : canBuyPhoneNumbers ? "Pay Now" : "Upgrade Required"}
      </Button>
    </form>
  );
};