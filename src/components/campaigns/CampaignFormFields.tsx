import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "./types";

interface CampaignFormFieldsProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignFormFields({ form }: CampaignFormFieldsProps) {
  const { toast } = useToast();

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-sm">Campaign Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter campaign name" {...field} className="h-8" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-sm">Message</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Type your message (max 160 characters)"
                maxLength={160}
                className="resize-none h-20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="media"
        render={({ field: { value, onChange, ...field } }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-sm">Media (Optional, max 5MB)</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*,video/*"
                className="h-8"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size <= 5 * 1024 * 1024) {
                    onChange(file);
                  } else {
                    toast({
                      title: "Error",
                      description: "File size must be less than 5MB",
                      variant: "destructive",
                    });
                  }
                }}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="scheduled_for"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-sm">Schedule (Optional)</FormLabel>
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
              disabled={(date) =>
                date < new Date() || date < new Date("1900-01-01")
              }
              className="rounded-md border"
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}