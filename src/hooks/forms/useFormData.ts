import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormField } from "@/types/form";
import { useToast } from "@/hooks/use-toast";

interface FormResponse {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  user_id: string;
  group_id: string;
  is_active: boolean | null;
}

interface UseFormDataReturn {
  form: FormResponse | null;
  loading: boolean;
  groups: any[];
  fetchForm: (formId: string) => Promise<void>;
}

export function useFormData(): UseFormDataReturn {
  const [form, setForm] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const { toast } = useToast();

  const validateFields = (fields: unknown): fields is FormField[] => {
    if (!Array.isArray(fields)) return false;
    return fields.every(field => 
      typeof field === 'object' && 
      field !== null && 
      'type' in field && 
      'label' in field
    );
  };

  const fetchForm = async (formId: string) => {
    try {
      const { data: formResponse, error: formError } = await supabase
        .from('custom_forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;
      if (!formResponse) throw new Error('Form not found');

      if (!validateFields(formResponse.fields)) {
        throw new Error('Invalid form fields format');
      }

      const formData: FormResponse = {
        id: formResponse.id,
        title: formResponse.title,
        description: formResponse.description,
        fields: formResponse.fields as FormField[],
        user_id: formResponse.user_id,
        group_id: formResponse.group_id,
        is_active: formResponse.is_active
      };

      setForm(formData);

      // Fetch groups for the form owner
      const { data: groupsData, error: groupsError } = await supabase
        .from('campaign_groups')
        .select('*')
        .eq('user_id', formResponse.user_id);

      if (groupsError) throw groupsError;
      setGroups(groupsData || []);
    } catch (error) {
      console.error('Error fetching form:', error);
      toast({
        title: "Error",
        description: "Failed to load form",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, groups, fetchForm };
}