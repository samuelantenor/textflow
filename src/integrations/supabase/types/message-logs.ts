export interface MessageLog {
  id: string;
  campaign_id: string;
  contact_id: string;
  twilio_message_sid: string;
  status: string;
  error_message?: string | null;
  response_message?: string | null;
  created_at: string;
  updated_at: string;
  contacts?: {
    name?: string | null;
    phone_number: string;
  };
}

export interface MessageLogInsert {
  id?: string;
  campaign_id: string;
  contact_id: string;
  twilio_message_sid: string;
  status?: string;
  error_message?: string | null;
  response_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MessageLogUpdate {
  id?: string;
  campaign_id?: string;
  contact_id?: string;
  twilio_message_sid?: string;
  status?: string;
  error_message?: string | null;
  response_message?: string | null;
  created_at?: string;
  updated_at?: string;
}