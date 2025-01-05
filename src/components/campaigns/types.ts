export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  message: string;
  media_url?: string;
  scheduled_for?: string;
  status: 'draft' | 'sent';
  created_at: string;
  updated_at: string;
}

export type CampaignFormData = {
  name: string;
  message: string;
  media?: File;
  scheduled_for?: Date;
};