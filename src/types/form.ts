export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'checkbox' | 'textarea' | 'number' | 'date' | 'radio' | 'select';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
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