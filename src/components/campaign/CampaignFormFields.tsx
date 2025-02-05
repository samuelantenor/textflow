
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GroupSelectField } from "./form-fields/GroupSelectField";
import { PhoneNumberField } from "./form-fields/PhoneNumberField";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CampaignFormFieldsProps {
  form: UseFormReturn<CampaignFormData>;
  showAllFields?: boolean;
}

export function CampaignFormFields({ form, showAllFields = false }: CampaignFormFieldsProps) {
  const { toast } = useToast();
  const message = form.watch("message") || "";
  const messageLength = message.length;
  const maxLength = 160;

  // Fetch campaign groups
  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_groups')
        .select('id, name')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching groups:', error);
        throw error;
      }
      return data;
    },
  });

  return (
    <div className="grid gap-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-200">Campaign Name</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter campaign name" 
                className="bg-black/30 border-gray-800 focus:border-primary-500/50"
                {...field} 
              />
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
            <FormLabel className="text-sm font-medium text-gray-200">Message</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Type your message here" 
                className="min-h-[120px] bg-black/30 border-gray-800 focus:border-primary-500/50"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showAllFields && (
        <>
          <FormField
            control={form.control}
            name="group_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-200">Contact Group</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-black/30 border-gray-800">
                      <SelectValue placeholder="Select a contact group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="scheduled_for"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium text-gray-200">Schedule Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-black/30 border-gray-800 hover:bg-black/50",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
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
                  <FormLabel className="text-sm font-medium text-gray-200">Schedule Time</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="time"
                        className="bg-black/30 border-gray-800 focus:border-primary-500/50 pl-10"
                        {...field}
                      />
                      <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="media"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-200">Media (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    className="bg-black/30 border-gray-800 focus:border-primary-500/50"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onChange(file);
                    }}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
}
