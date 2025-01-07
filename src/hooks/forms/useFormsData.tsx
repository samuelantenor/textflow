import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomForm } from "@/components/forms/types";

export function useFormsData() {
  const queryClient = useQueryClient();

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_groups')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: forms, isLoading: isLoadingForms } = useQuery({
    queryKey: ['custom-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms')
        .select(`
          id,
          title,
          description,
          fields,
          group_id,
          background_color,
          font_family,
          logo_url,
          primary_color,
          campaign_groups (
            name
          )
        `);
      
      if (error) throw error;
      
      return (data || []).map(form => ({
        ...form,
        fields: Array.isArray(form.fields) ? form.fields : []
      })) as CustomForm[];
    },
  });

  return {
    forms,
    groups,
    isLoadingForms,
    isLoadingGroups,
    queryClient
  };
}