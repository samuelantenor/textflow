import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneNumberDetails } from "./PhoneNumberDetails";
import { PhoneNumberSearchForm, SearchForm } from "./PhoneNumberSearchForm";
import { PhoneNumberList } from "./PhoneNumberList";
import { PhoneNumber } from "./types";

export const PhoneNumberSearch = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialNumbers();
  }, []);

  const fetchInitialNumbers = async () => {
    try {
      setIsSearching(true);
      const { data: numbers, error } = await supabase.functions.invoke('search-phone-numbers', {
        body: {
          capabilities: {
            sms: true,
            voice: true,
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
        description: "Failed to fetch phone numbers",
      });
    } finally {
      setIsSearching(false);
    }
  };

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
      <PhoneNumberSearchForm onSearch={onSearch} isSearching={isSearching} />

      {isSearching && (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {numbers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Numbers</h3>
          <PhoneNumberList
            numbers={numbers}
            onSelect={setSelectedNumber}
            onPurchase={handlePurchase}
            isPurchasing={isPurchasing}
          />
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