import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  // Add more countries as needed
];

export function BuyPhoneNumberForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the URL has a success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setShowThankYou(true);
    }
  }, []);

  if (showThankYou) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-4">Thank you for your payment!</h3>
        <p className="text-muted-foreground">
          Your new phone number is on its way. We'll process your request and contact you shortly.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Your Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            name="company"
            type="text"
            required
            placeholder="Your Company Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select name="region">
            <SelectTrigger>
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Monthly Fee</span>
            <span className="text-lg font-semibold">$5.00</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This includes unlimited incoming messages and competitive rates for outgoing messages.
          </p>
          <stripe-buy-button
            buy-button-id="buy_btn_1QeVcgB4RWKZ2dNza9CFKIwx"
            publishable-key="pk_test_51QL67PB4RWKZ2dNzsxovpn7D6fAiFm6cj7aH3TDwv1HmrQgAh4CJUpBZJdKqLWPj9uNHsj3j4IgLrynaKEqbp95n00KL67n19K"
          >
          </stripe-buy-button>
        </div>
      </form>
    </Card>
  );
}