import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignFormData } from "@/types/campaign";

interface GroupSelectFieldProps {
  form: UseFormReturn<CampaignFormData>;
}

export function GroupSelectField({ form }: GroupSelectFieldProps) {
  const { data: groups } = useQuery({
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
    <FormField
      control={form.control}
      name="group_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contact Group</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact group" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {groups?.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name} ({group.contacts[0]?.count || 0} contacts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}