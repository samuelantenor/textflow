import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone } from "lucide-react";
import { PhoneNumberDetails } from "./PhoneNumberDetails";

interface SearchForm {
  areaCode: string;
  pattern: string;
  sms: boolean;
  voice: boolean;
}

interface PhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  capabilities: string[];
  monthlyCost: number;
}

export const PhoneNumberSearch = ({ onSuccess }: { onSuccess: () => void }) => {
  const { register, handleSubmit } = useForm<SearchForm>();
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const { toast } = useToast();

  const onSearch = async (data: SearchForm) => {
    try {
      setIsSearching(true);
      const { data: numbers, error } = await supabase.functions.invoke('search-phone-numbers', {
        body: {
          areaCode: data.areaCode,
          pattern: data.pattern,
          capabilities: {
            sms: data.sms,
            voice: data.voice,
          },
        },
      });

      if (error) throw error;
      setNumbers(numbers);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search for phone numbers",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePurchase = async (number: PhoneNumber) => {
    try {
      setIsPurchasing(true);
      const { error } = await supabase.functions.invoke('purchase-phone-number', {
        body: { phoneNumber: number.phoneNumber },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Phone number purchased successfully",
      });
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to purchase phone number",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="areaCode">Area Code</Label>
            <Input
              id="areaCode"
              placeholder="e.g. 415"
              {...register("areaCode")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pattern">Number Pattern</Label>
            <Input
              id="pattern"
              placeholder="e.g. 555****"
              {...register("pattern")}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="sms" {...register("sms")} />
            <Label htmlFor="sms">SMS</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="voice" {...register("voice")} />
            <Label htmlFor="voice">Voice</Label>
          </div>
        </div>

        <Button type="submit" disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Phone className="mr-2 h-4 w-4" />
          )}
          Search Numbers
        </Button>
      </form>

      {numbers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Numbers</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {numbers.map((number) => (
              <Card
                key={number.phoneNumber}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedNumber(number)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{number.friendlyName}</p>
                    <p className="text-sm text-muted-foreground">
                      Capabilities: {number.capabilities.join(", ")}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    ${number.monthlyCost}/month
                  </p>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(number);
                  }}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Purchase"
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedNumber && (
        <PhoneNumberDetails
          number={selectedNumber}
          onClose={() => setSelectedNumber(null)}
        />
      )}
    </div>
  );
};