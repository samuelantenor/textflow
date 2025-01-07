import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";

interface MessageFieldProps {
  form: UseFormReturn<CampaignFormData>;
}

export function MessageField({ form }: MessageFieldProps) {
  const message = form.watch("message") || "";
  const messageLength = message.length;
  const maxLength = 160;

  return (
    <FormField
      control={form.control}
      name="message"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Message</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Type your message here..."
              className="min-h-[120px] resize-none"
              maxLength={maxLength}
              {...field}
            />
          </FormControl>
          <FormDescription className="flex justify-end">
            {messageLength}/{maxLength} characters
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}