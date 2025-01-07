import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";

interface ScheduleFieldsProps {
  form: UseFormReturn<CampaignFormData>;
}

export function ScheduleFields({ form }: ScheduleFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="scheduled_for"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Schedule Date (Optional)</FormLabel>
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
            <FormLabel>Schedule Time</FormLabel>
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
  );
}