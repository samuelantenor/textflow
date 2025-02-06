
export interface MessageLog {
  id: string;
  campaign_id: string | null;  // Now nullable
  contact_id: string | null;  // Already nullable
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
  // New fields to preserve contact info
  contact_name?: string | null;
  contact_phone_number?: string | null;
  user_id: string;
}

export interface MessageLogInsert {
  id?: string;
  campaign_id: string | null;  // Now nullable
  contact_id: string | null;  // Already nullable
  twilio_message_sid: string;
  status?: string;
  error_message?: string | null;
  response_message?: string | null;
  created_at?: string;
  updated_at?: string;
  contact_name?: string | null;
  contact_phone_number?: string | null;
}

export interface MessageLogUpdate {
  id?: string;
  campaign_id?: string | null;  // Now nullable
  contact_id?: string | null;  // Already nullable
  twilio_message_sid?: string;
  status?: string;
  error_message?: string | null;
  response_message?: string | null;
  created_at?: string;
  updated_at?: string;
  contact_name?: string | null;
  contact_phone_number?: string | null;
}
