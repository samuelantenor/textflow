import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { CampaignFormData } from "@/types/campaign";

interface MediaFieldProps {
  form: UseFormReturn<CampaignFormData>;
}

export function MediaField({ form }: MediaFieldProps) {
  const { toast } = useToast();

  return (
    <FormField
      control={form.control}
      name="media"
      render={({ field: { value, onChange, ...field } }) => (
        <FormItem>
          <FormLabel>Media (Optional, max 5MB)</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*,video/*"
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
  );
}