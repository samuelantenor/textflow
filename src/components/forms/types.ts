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
  background_image_url?: string | null;
  background_image_style?: 'cover' | 'contain' | 'repeat';
  background_opacity?: number;
  input_background_color?: string;
  show_border?: boolean;
  website_background_color?: string;
  website_background_gradient?: string | null;
  website_background_image_url?: string | null;
  website_background_style?: 'color' | 'gradient' | 'image';
}