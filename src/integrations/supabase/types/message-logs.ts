export interface MessageLog {
  id: string;
  campaign_id: string;
  contact_id: string;
  twilio_message_sid: string;
  status: string;
  error_message?: string;
  response_message?: string;
  created_at: string;
  updated_at: string;
  contacts?: {
    name?: string;
    phone_number: string;
  };
}

export interface MessageLogInsert {
  id?: string;
  campaign_id: string;
  contact_id: string;
  twilio_message_sid: string;
  status?: string;
  error_message?: string;
  response_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MessageLogUpdate {
  id?: string;
  campaign_id?: string;
  contact_id?: string;
  twilio_message_sid?: string;
  status?: string;
  error_message?: string;
  response_message?: string;
  created_at?: string;
  updated_at?: string;
}