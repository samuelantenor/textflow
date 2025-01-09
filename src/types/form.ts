export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;  
  placeholder?: string;
  description?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

export interface FormResponse {
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
}