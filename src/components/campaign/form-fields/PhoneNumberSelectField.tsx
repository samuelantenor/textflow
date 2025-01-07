import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignFormData } from "@/types/campaign";
import { Phone } from "lucide-react";

interface PhoneNumberSelectFieldProps {
  form: UseFormReturn<CampaignFormData>;
}

export function PhoneNumberSelectField({ form }: PhoneNumberSelectFieldProps) {
  const { data: phoneNumbers } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={form.control}
      name="phone_number_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sender Phone Number</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a phone number">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>Select a phone number</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {phoneNumbers?.map((number) => (
                <SelectItem key={number.id} value={number.id}>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{number.phone_number}</span>
                  </div>
                </SelectItem>
              ))}
              {(!phoneNumbers || phoneNumbers.length === 0) && (
                <SelectItem value="none" disabled>
                  No phone numbers available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}