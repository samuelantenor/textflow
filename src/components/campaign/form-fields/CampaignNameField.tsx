import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";

interface CampaignNameFieldProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignNameField({ form }: CampaignNameFieldProps) {
  return (
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
  );
}