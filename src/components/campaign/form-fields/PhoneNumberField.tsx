import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignFormData } from "@/types/campaign";
import { Phone } from "lucide-react";

interface PhoneNumberFieldProps {
  form: UseFormReturn<CampaignFormData>;
}

export function PhoneNumberField({ form }: PhoneNumberFieldProps) {
  const { data: phoneNumbers, isLoading } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={form.control}
      name="from_number"
      render={({ field }) => (
        <FormItem>
          <FormLabel>From Number</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a number to send from">
                  {field.value && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{field.value}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {phoneNumbers?.map((number) => (
                number.phone_number && (
                  <SelectItem key={number.id} value={number.phone_number}>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{number.phone_number}</span>
                    </div>
                  </SelectItem>
                )
              ))}
              {(!phoneNumbers || phoneNumbers.length === 0) && (
                <SelectItem value="no-numbers" disabled>
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