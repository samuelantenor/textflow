import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { supabase } from "@/integrations/supabase/client";

export function BuyPhoneNumberForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState('us');
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase a phone number.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/functions/create-phone-number-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country }),
      });

      const { url, error } = await response.json();
      
      if (error) throw new Error(error);
      if (url) window.location.href = url;
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Request a New Phone Number</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose your preferred region to get a local phone number.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Your Email</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            type="text"
            required
            placeholder="Your Company Name"
          />
        </div>

        <div className="space-y-2">
          <Label>Choose Region</Label>
          <PhoneInput
            country={country}
            onChange={(value) => setCountry(value)}
            enableSearch
            inputClass="!w-full"
            containerClass="!w-full"
            searchClass="!w-full"
            dropdownClass="!w-full"
            disableSearchIcon
            inputProps={{
              required: true,
              className: "w-full"
            }}
            disabled
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Monthly fee</span>
            <span className="text-lg font-semibold">$5.00/month</span>
          </div>
          
          <Button 
            onClick={handlePayment}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Pay Now"}
          </Button>
        </div>
      </div>
    </Card>
  );
}