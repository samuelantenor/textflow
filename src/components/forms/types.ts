export interface CustomForm {
  id: string;
  title: string;
  description: string | null;
  fields: any[];
  campaign_groups: {
    name: string;
  } | null;
  group_id: string;
  background_color?: string;
  font_family?: string;
  logo_url?: string | null;
  primary_color?: string;
  submit_button_color?: string;
  input_background_color?: string;
  show_border?: boolean;
  website_background_color?: string;
  website_background_gradient?: string | null;
  website_background_image_url?: string | null;
  website_background_style?: 'color' | 'gradient' | 'image';
}

export interface FormData {
  title: string;
  description: string;
  fields: any[];
  group_id: string;
  background_color?: string;
  font_family?: string;
  logo_url?: string | null;
  primary_color?: string;
  submit_button_color?: string;
  input_background_color?: string;
  show_border?: boolean;
  website_background_color?: string;
  website_background_gradient?: string | null;
  website_background_image_url?: string | null;
  website_background_style?: 'color' | 'gradient' | 'image';
}