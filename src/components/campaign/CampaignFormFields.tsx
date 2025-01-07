import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CampaignFormData } from "@/types/campaign";
import { PhoneNumberSelectField } from "./form-fields/PhoneNumberSelectField";
import { GroupSelectField } from "./form-fields/GroupSelectField";
import { MediaUploadField } from "./form-fields/MediaUploadField";
import { ScheduleFields } from "./form-fields/ScheduleFields";

interface CampaignFormFieldsProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignFormFields({ form }: CampaignFormFieldsProps) {
  return (
    <div className="space-y-4">
      <PhoneNumberSelectField form={form} />
      <GroupSelectField form={form} />

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

      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Message Content</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Type your message here..."
                maxLength={160}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <MediaUploadField form={form} />
      <ScheduleFields form={form} />
    </div>
  );
}