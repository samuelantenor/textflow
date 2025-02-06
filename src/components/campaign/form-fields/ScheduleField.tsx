
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal bg-black/30 border-gray-800",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>{t('form.schedule.placeholder')}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    // If no time is set, set a default time
                    if (date && !form.getValues("scheduled_time")) {
                      form.setValue("scheduled_time", "09:00");
                    }
                  }}
                  disabled={(date) =>
                    date < new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
                  className="pl-10 bg-black/30 border-gray-800"
                  {...field}
                  disabled={!scheduledFor}
                />
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              </div>
            </FormControl>
            <FormDescription>
              {scheduledFor ? format(scheduledFor, "z") : "UTC"}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
