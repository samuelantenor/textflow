export type CampaignFormData = {
  name: string;
  message: string;
  media?: File;
  scheduled_for?: Date;
  scheduled_time?: string;
};

export type CampaignStatus = 'draft' | 'sent';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  message: string;
  media_url?: string;
  scheduled_for?: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}