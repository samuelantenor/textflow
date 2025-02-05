import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
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
            <Input 
              placeholder="Enter a name for your campaign"
              className="w-full"
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Give your campaign a memorable name
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}