import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SendTestMessageFormData } from "./types";

interface TestMessageFormFieldsProps {
  form: UseFormReturn<SendTestMessageFormData>;
}

export function TestMessageFormFields({ form }: TestMessageFormFieldsProps) {
  const { data: phoneNumbers } = useQuery({
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
    <>
      <FormField
        control={form.control}
        name="fromNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>From Number</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a number to send from">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{field.value}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {phoneNumbers?.map((number) => (
                  <SelectItem key={number.id} value={number.phone_number}>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{number.phone_number}</span>
                    </div>
                  </SelectItem>
                ))}
                {(!phoneNumbers || phoneNumbers.length === 0) && (
                  <SelectItem value="" disabled>
                    No phone numbers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>To Number</FormLabel>
            <FormControl>
              <div className="flex items-center w-full">
                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="+1234567890" 
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Message</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Type your test message here"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}