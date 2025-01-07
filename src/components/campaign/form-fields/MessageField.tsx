import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";

interface MessageFieldProps {
  form: UseFormReturn<CampaignFormData>;
}

export function MessageField({ form }: MessageFieldProps) {
  return (
    <FormField
      control={form.control}
      name="message"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Message</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Type your message (max 160 characters)"
              maxLength={160}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}