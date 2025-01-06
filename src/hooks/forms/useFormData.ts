import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormField } from "@/types/form";

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
  isLoading: boolean;
  error: Error | null;
}

export function useFormData(formId: string | undefined): UseFormDataReturn {
  const [form, setForm] = useState<FormResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!formId) {
      setError(new Error("Form ID is required"));
      setIsLoading(false);
      return;
    }

    const fetchFormData = async () => {
      try {
        const { data: formResponse, error: formError } = await supabase
          .from('custom_forms')
          .select('*')
          .eq('id', formId)
          .single();

        if (formError) throw formError;

        if (!Array.isArray(formResponse.fields)) {
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
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch form data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [formId]);

  return { form, isLoading, error };
}