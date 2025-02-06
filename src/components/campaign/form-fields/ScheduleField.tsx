
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";
import { useTranslation } from "react-i18next";

interface ScheduleFieldProps {
  form: UseFormReturn<CampaignFormData>;
}

export function ScheduleField({ form }: ScheduleFieldProps) {
  const { t } = useTranslation(['campaigns']);
  const scheduledFor = form.watch("scheduled_for");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="scheduled_for"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t('form.schedule.label')}</FormLabel>
            <FormControl>
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  if (date) {
                    const currentDate = new Date();
                    // If the selected date is today, set time to next hour
                    if (date.toDateString() === currentDate.toDateString()) {
                      const nextHour = new Date();
                      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
                      field.onChange(nextHour);
                      form.setValue("scheduled_time", 
                        `${nextHour.getHours().toString().padStart(2, '0')}:00`
                      );
                    } else {
                      // For future dates, default to 9 AM
                      date.setHours(9, 0, 0, 0);
                      field.onChange(date);
                      form.setValue("scheduled_time", "09:00");
                    }
                  } else {
                    field.onChange(date);
                    form.setValue("scheduled_time", undefined);
                  }
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                initialFocus
                className="rounded-md border border-gray-800 bg-black/95 w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="scheduled_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('form.schedule.time')}</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type="time"
                  className="pl-10 bg-black/30 border-gray-800 focus:border-primary-500/50"
                  {...field}
                  disabled={!scheduledFor}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    if (scheduledFor && e.target.value) {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(scheduledFor);
                      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
                      form.setValue("scheduled_for", newDate);
                    }
                  }}
                />
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              </div>
            </FormControl>
            <FormDescription className="text-gray-400">
              {scheduledFor ? format(scheduledFor, "z") : "UTC"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
