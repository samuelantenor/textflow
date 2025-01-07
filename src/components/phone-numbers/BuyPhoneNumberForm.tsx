import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

const regions = [
  { value: "us", label: "United States (+1)" },
  { value: "ca", label: "Canada (+1)" },
  { value: "gb", label: "United Kingdom (+44)" },
  { value: "au", label: "Australia (+61)" },
  { value: "de", label: "Germany (+49)" },
  { value: "fr", label: "France (+33)" },
  { value: "it", label: "Italy (+39)" },
  { value: "es", label: "Spain (+34)" },
  { value: "pt", label: "Portugal (+351)" },
  { value: "nl", label: "Netherlands (+31)" },
  { value: "be", label: "Belgium (+32)" },
  { value: "ch", label: "Switzerland (+41)" },
  { value: "at", label: "Austria (+43)" },
  { value: "se", label: "Sweden (+46)" },
  { value: "no", label: "Norway (+47)" },
  { value: "dk", label: "Denmark (+45)" },
  { value: "fi", label: "Finland (+358)" },
  { value: "ie", label: "Ireland (+353)" },
  { value: "nz", label: "New Zealand (+64)" },
  { value: "jp", label: "Japan (+81)" },
  { value: "kr", label: "South Korea (+82)" },
  { value: "sg", label: "Singapore (+65)" },
  { value: "hk", label: "Hong Kong (+852)" },
  { value: "mx", label: "Mexico (+52)" },
  { value: "br", label: "Brazil (+55)" },
  { value: "ar", label: "Argentina (+54)" },
  { value: "cl", label: "Chile (+56)" },
  { value: "za", label: "South Africa (+27)" },
  { value: "in", label: "India (+91)" },
  { value: "ph", label: "Philippines (+63)" },
  { value: "my", label: "Malaysia (+60)" },
  { value: "id", label: "Indonesia (+62)" },
  { value: "th", label: "Thailand (+66)" },
  { value: "vn", label: "Vietnam (+84)" },
  { value: "ae", label: "United Arab Emirates (+971)" },
  { value: "sa", label: "Saudi Arabia (+966)" },
  { value: "il", label: "Israel (+972)" },
  { value: "tr", label: "Turkey (+90)" },
  { value: "ru", label: "Russia (+7)" },
  { value: "pl", label: "Poland (+48)" },
];

export const BuyPhoneNumberForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredRegions = regions.filter((region) =>
    region.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!country) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a region",
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

      // Show success message before redirect
      toast({
        title: "Redirecting to checkout...",
        description: "You'll be redirected to complete your payment.",
      });

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
        <Label>Select Region</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a region" />
          </SelectTrigger>
          <SelectContent className="h-[300px]">
            <div className="sticky top-0 p-2 bg-popover border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
            </div>
            <ScrollArea className="h-[calc(300px-56px)]" type="always">
              <div className="p-2">
                {filteredRegions.map((region) => (
                  <SelectItem 
                    key={region.value} 
                    value={region.value}
                    className="rounded-md cursor-pointer"
                  >
                    {region.label}
                  </SelectItem>
                ))}
              </div>
            </ScrollArea>
          </SelectContent>
        </Select>
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
