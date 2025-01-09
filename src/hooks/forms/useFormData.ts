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
  background_color: string | null;
  font_family: string | null;
  logo_url: string | null;
  primary_color: string | null;
  background_image_url: string | null;
  background_image_style: 'cover' | 'contain' | 'repeat' | null;
  background_opacity: number | null;
  input_background_color: string | null;
  show_border: boolean | null;
  website_background_color: string | null;
  website_background_gradient: string | null;
  website_background_image_url: string | null;
  website_background_style: 'color' | 'gradient' | 'image' | null;
}

interface UseFormDataReturn {
  form: FormResponse | null;
  loading: boolean;
  fetchForm: (formId: string) => Promise<void>;
}

export function useFormData(): UseFormDataReturn {
  const [form, setForm] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const validateField = (field: any): field is FormField => {
    return (
      typeof field === 'object' &&
      field !== null &&
      typeof field.id === 'string' &&
      typeof field.type === 'string' &&
      typeof field.label === 'string' &&
      typeof field.required === 'boolean'
    );
  };

  const validateFields = (fields: any[]): fields is FormField[] => {
    return Array.isArray(fields) && fields.every(validateField);
  };

  const fetchForm = async (formId: string) => {
    try {
      setLoading(true);
      console.log('Fetching form with ID:', formId);

      const { data: formResponse, error: formError } = await supabase
        .from('custom_forms')
        .select(`
          id,
          title,
          description,
          fields,
          user_id,
          group_id,
          is_active,
          background_color,
          font_family,
          logo_url,
          primary_color,
          background_image_url,
          background_image_style,
          background_opacity,
          input_background_color,
          show_border,
          website_background_color,
          website_background_gradient,
          website_background_image_url,
          website_background_style
        `)
        .eq('id', formId)
        .single();

      if (formError) {
        console.error('Error fetching form:', formError);
        throw formError;
      }

      if (!formResponse) {
        console.error('Form not found');
        throw new Error('Form not found');
      }

      // Ensure fields is an array and validate its structure
      const fields = Array.isArray(formResponse.fields) ? formResponse.fields : [];
      
      // Transform the fields to ensure they have all required properties
      const transformedFields: FormField[] = fields.map((field: any, index: number) => ({
        id: field.id || `field-${index}`,
        type: field.type || 'text',
        label: field.label || '',
        required: field.required || false,
        placeholder: field.placeholder,
        description: field.description,
        options: Array.isArray(field.options) 
          ? field.options.map((opt: any) => ({
              label: typeof opt === 'string' ? opt : opt.label || '',
              value: typeof opt === 'string' ? opt : opt.value || ''
            }))
          : undefined
      }));

      if (!validateFields(transformedFields)) {
        throw new Error('Invalid form fields format');
      }

      const validatedForm: FormResponse = {
        ...formResponse,
        fields: transformedFields,
        background_image_style: (formResponse.background_image_style as 'cover' | 'contain' | 'repeat' | null) || null,
        background_opacity: formResponse.background_opacity || 100,
        input_background_color: formResponse.input_background_color || '#FFFFFF',
        show_border: formResponse.show_border ?? true,
        website_background_color: formResponse.website_background_color || '#FFFFFF',
        website_background_gradient: formResponse.website_background_gradient || null,
        website_background_image_url: formResponse.website_background_image_url || null,
        website_background_style: (formResponse.website_background_style as 'color' | 'gradient' | 'image' | null) || 'color',
      };

      setForm(validatedForm);
    } catch (error) {
      console.error('Error fetching form:', error);
      toast({
        title: "Error",
        description: "Failed to load form. Please check if the form exists and is active.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, fetchForm };
}