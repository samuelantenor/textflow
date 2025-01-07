import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { CustomForm } from "@/components/forms/types";

export const useFormsData = () => {
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

  const { data: forms, isLoading } = useQuery({
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

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('custom_forms_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_forms'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['custom-forms'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    forms,
    groups,
    isLoading,
    isLoadingGroups
  };
};