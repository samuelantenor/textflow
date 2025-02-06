
export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  message: string;
  scheduled_for?: string;
  scheduled_at?: string;
  timezone?: string;
  status: 'draft' | 'scheduled' | 'sent';
  created_at: string;
  updated_at: string;
  group_id?: string;
  from_number?: string;
}

export type CampaignFormData = {
  name: string;
  message: string;
  scheduled_for?: Date;
  scheduled_time?: string;
  group_id: string;
  from_number?: string;
};
