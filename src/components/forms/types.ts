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
  logo_url?: string;
  primary_color?: string;
}