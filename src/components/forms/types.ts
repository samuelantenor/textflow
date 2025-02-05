export interface CustomForm {
  id: string;
  title: string;
  description: string | null;
  fields: any[];
  campaign_groups?: {
    name: string;
  } | null;
  group_id: string;
  background_color?: string;
  font_family?: string;
  logo_url?: string;
  primary_color?: string;
  background_image_url?: string;
  background_image_style?: string;
  background_opacity?: number;
  input_background_color?: string;
  show_border?: boolean;
}

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