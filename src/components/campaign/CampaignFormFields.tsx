import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { GroupSelectField } from "./form-fields/GroupSelectField";
import { PhoneNumberField } from "./form-fields/PhoneNumberField";

interface CampaignFormFieldsProps {
  form: UseFormReturn<CampaignFormData>;
  showAllFields?: boolean;
}

export function CampaignFormFields({ form, showAllFields = false }: CampaignFormFieldsProps) {
  const { toast } = useToast();
  const message = form.watch("message") || "";
  const messageLength = message.length;
  const maxLength = 160;

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Campaign Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter campaign name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className={showAllFields ? "" : "hidden"}>
        <GroupSelectField form={form} />

        <PhoneNumberField form={form} />

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

        <FormField
          control={form.control}
          name="media"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Media (Optional, max 10MB)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 10 * 1024 * 1024) {
                      onChange(file);
                    } else {
                      toast({
                        title: "Error",
                        description: "File size must be less than 10MB",
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

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="scheduled_for"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Schedule (Optional)</FormLabel>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date < new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    disabled={!form.watch("scheduled_for")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}