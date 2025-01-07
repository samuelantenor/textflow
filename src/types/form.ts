export interface FormField {
  id: string;  // Added this field
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: string[];
}

export interface FormData {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  background_color?: string;
  font_family?: string;
  logo_url?: string;
  primary_color?: string;
}