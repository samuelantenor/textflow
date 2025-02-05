
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomForm } from "@/components/forms/types";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function useFormsData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation(["forms"]);

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('campaign_groups')
        .select('*');
      
      if (error) {
        console.error('Error fetching groups:', error);
        throw error;
      }

      return data;
    },
  });

  const { data: forms, isLoading: isLoadingForms, error: formsError } = useQuery({
    queryKey: ['custom-forms'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
          welcome_message_template,
          campaign_groups (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching forms:', error);
        toast({
          title: t("errors.fetchForms"),
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return (data || []).map(form => ({
        ...form,
        fields: Array.isArray(form.fields) ? form.fields : [],
        welcome_message_template: form.welcome_message_template || {
          en: "Thank you for submitting the form '{title}'. We have received your response and will be in touch soon.",
          fr: "Merci d'avoir soumis le formulaire '{title}'. Nous avons bien reçu votre réponse et nous vous contacterons bientôt."
        }
      })) as CustomForm[];
    },
    retry: false,
  });

  return {
    forms,
    groups,
    isLoadingForms,
    isLoadingGroups,
    formsError,
    queryClient
  };
}
