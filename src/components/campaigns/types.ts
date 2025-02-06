
export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  message: string;
  media_url?: string;
  scheduled_for?: string;
  status: 'draft' | 'sent' | 'deleted';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  group_id?: string;
}

export type CampaignFormData = {
  name: string;
  message: string;
  media?: File;
  scheduled_for?: Date;
  scheduled_time?: string;
  group_id: string;
  from_number?: string;
};
