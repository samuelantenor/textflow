import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CampaignFormData } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Users } from "lucide-react";

interface CampaignFormFieldsProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignFormFields({ form }: CampaignFormFieldsProps) {
  const { toast } = useToast();

  const { data: phoneNumbers } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: groups } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_groups')
        .select('*, contacts(count)');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="phone_number_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sender Phone Number</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a phone number">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>Select a phone number</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {phoneNumbers?.map((number) => (
                  <SelectItem key={number.id} value={number.id}>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{number.phone_number}</span>
                    </div>
                  </SelectItem>
                ))}
                {(!phoneNumbers || phoneNumbers.length === 0) && (
                  <SelectItem value="none" disabled>
                    No phone numbers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
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
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a contact group">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Select a contact group</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {groups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{group.name} ({group.contacts[0]?.count || 0} contacts)</span>
                    </div>
                  </SelectItem>
                ))}
                {(!groups || groups.length === 0) && (
                  <SelectItem value="none" disabled>
                    No contact groups available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

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
    </div>
  );
}