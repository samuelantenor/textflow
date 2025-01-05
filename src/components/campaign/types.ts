export type CampaignFormData = {
  name: string;
  message: string;
  media?: File;
  scheduled_for?: Date;
  scheduled_time?: string;
};