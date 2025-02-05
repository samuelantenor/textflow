export type CampaignFormData = {
  name: string;
  message: string;
  media?: File;
  scheduled_for?: Date;
  scheduled_time?: string;
  group_id: string;
  from_number?: string;
};