import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "./types";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignFormFieldsProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignFormFields({ form }: CampaignFormFieldsProps) {
  const { toast } = useToast();
  const { data: groups, isLoading } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_groups')
        .select('id, name, contacts(count)');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
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
        name="group_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Group</FormLabel>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.contacts?.[0]?.count || 0} contacts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Message</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Type your message (max 160 characters)"
                maxLength={160}
                className="resize-none"
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

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="scheduled_for"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule Date (Optional)</FormLabel>
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
    </div>
  );
}