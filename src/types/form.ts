import { Json } from "@/integrations/supabase/types";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'checkbox' | 'textarea' | 'number' | 'date' | 'radio' | 'select';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  description?: string;
}

export interface FormData {
  title: string;
  description?: string;
  group_id: string;
  background_color?: string;
  font_family?: string;
  logo_url?: string;
  primary_color?: string;
  fields: FormField[];
}

// Type guard to ensure FormField array is valid Json
export function isJsonFields(fields: FormField[]): fields is Json[] {
  return Array.isArray(fields) && fields.every(field => 
    typeof field === 'object' && 
    field !== null && 
    typeof (field as FormField).type === 'string' &&
    typeof (field as FormField).label === 'string'
  );
}