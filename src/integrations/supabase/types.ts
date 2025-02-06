export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auth_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_used_at: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          last_used_at?: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_used_at?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_analytics: {
        Row: {
          campaign_id: string
          click_rate: number
          cost: number
          created_at: string
          delivery_rate: number
          id: string
          open_rate: number
          revenue: number
          updated_at: string
        }
        Insert: {
          campaign_id: string
          click_rate?: number
          cost?: number
          created_at?: string
          delivery_rate?: number
          id?: string
          open_rate?: number
          revenue?: number
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          click_rate?: number
          cost?: number
          created_at?: string
          delivery_rate?: number
          id?: string
          open_rate?: number
          revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string
          error_log: string | null
          from_number: string | null
          group_id: string | null
          id: string
          last_processing_started: string | null
          media_url: string | null
          message: string | null
          name: string
          processing_status: string | null
          retry_count: number | null
          scheduled_at: string | null
          scheduled_for: string | null
          scheduled_job_id: string | null
          status: string
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_log?: string | null
          from_number?: string | null
          group_id?: string | null
          id?: string
          last_processing_started?: string | null
          media_url?: string | null
          message?: string | null
          name: string
          processing_status?: string | null
          retry_count?: number | null
          scheduled_at?: string | null
          scheduled_for?: string | null
          scheduled_job_id?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_log?: string | null
          from_number?: string | null
          group_id?: string | null
          id?: string
          last_processing_started?: string | null
          media_url?: string | null
          message?: string | null
          name?: string
          processing_status?: string | null
          retry_count?: number | null
          scheduled_at?: string | null
          scheduled_for?: string | null
          scheduled_job_id?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_from_number_fkey"
            columns: ["from_number"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["phone_number"]
          },
          {
            foreignKeyName: "campaigns_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "campaign_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          group_id: string
          id: string
          name: string | null
          phone_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          name?: string | null
          phone_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          name?: string | null
          phone_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "campaign_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_forms: {
        Row: {
          background_color: string | null
          background_image_style: string | null
          background_image_url: string | null
          background_opacity: number | null
          created_at: string
          description: string | null
          fields: Json
          font_family: string | null
          group_id: string
          id: string
          input_background_color: string | null
          is_active: boolean | null
          logo_url: string | null
          primary_color: string | null
          show_border: boolean | null
          submit_button_color: string | null
          title: string
          updated_at: string
          user_id: string
          website_background_color: string | null
          website_background_gradient: string | null
          website_background_image_url: string | null
          website_background_style: string | null
          welcome_message_template: Json | null
        }
        Insert: {
          background_color?: string | null
          background_image_style?: string | null
          background_image_url?: string | null
          background_opacity?: number | null
          created_at?: string
          description?: string | null
          fields?: Json
          font_family?: string | null
          group_id: string
          id?: string
          input_background_color?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          show_border?: boolean | null
          submit_button_color?: string | null
          title: string
          updated_at?: string
          user_id: string
          website_background_color?: string | null
          website_background_gradient?: string | null
          website_background_image_url?: string | null
          website_background_style?: string | null
          welcome_message_template?: Json | null
        }
        Update: {
          background_color?: string | null
          background_image_style?: string | null
          background_image_url?: string | null
          background_opacity?: number | null
          created_at?: string
          description?: string | null
          fields?: Json
          font_family?: string | null
          group_id?: string
          id?: string
          input_background_color?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          show_border?: boolean | null
          submit_button_color?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          website_background_color?: string | null
          website_background_gradient?: string | null
          website_background_image_url?: string | null
          website_background_style?: string | null
          welcome_message_template?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_forms_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "campaign_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          created_at: string
          data: Json
          form_id: string
          id: string
        }
        Insert: {
          created_at?: string
          data: Json
          form_id: string
          id?: string
        }
        Update: {
          created_at?: string
          data?: Json
          form_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "custom_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          background_color: string | null
          created_at: string
          description: string | null
          font_family: string
          id: string
          logo_url: string | null
          primary_color: string
          published: boolean
          template_id: string
          title: string
          updated_at: string
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          font_family?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          published?: boolean
          template_id: string
          title: string
          updated_at?: string
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          font_family?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          published?: boolean
          template_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      message_logs: {
        Row: {
          campaign_id: string
          contact_id: string | null
          contact_name: string | null
          contact_phone_number: string | null
          created_at: string
          error_message: string | null
          id: string
          response_message: string | null
          status: string
          twilio_message_sid: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          contact_id?: string | null
          contact_name?: string | null
          contact_phone_number?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          response_message?: string | null
          status?: string
          twilio_message_sid: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          contact_id?: string | null
          contact_name?: string | null
          contact_phone_number?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          response_message?: string | null
          status?: string
          twilio_message_sid?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_date: string
          payment_method: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_number_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          region: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          region: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          region?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          capabilities: Json
          created_at: string
          friendly_name: string | null
          id: string
          monthly_cost: number
          phone_number: string
          sms_url: string | null
          status: string
          twilio_sid: string
          updated_at: string
          user_id: string
          voice_url: string | null
        }
        Insert: {
          capabilities?: Json
          created_at?: string
          friendly_name?: string | null
          id?: string
          monthly_cost: number
          phone_number: string
          sms_url?: string | null
          status?: string
          twilio_sid: string
          updated_at?: string
          user_id: string
          voice_url?: string | null
        }
        Update: {
          capabilities?: Json
          created_at?: string
          friendly_name?: string | null
          id?: string
          monthly_cost?: number
          phone_number?: string
          sms_url?: string | null
          status?: string
          twilio_sid?: string
          updated_at?: string
          user_id?: string
          voice_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          campaign_limit: number
          created_at: string
          has_been_paid: boolean | null
          id: string
          monthly_message_limit: number
          plan_type: string
          status: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_limit?: number
          created_at?: string
          has_been_paid?: boolean | null
          id?: string
          monthly_message_limit?: number
          plan_type?: string
          status: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_limit?: number
          created_at?: string
          has_been_paid?: boolean | null
          id?: string
          monthly_message_limit?: number
          plan_type?: string
          status?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_campaign_message_stats: {
        Args: {
          p_user_id: string
        }
        Returns: {
          campaign_status: string
          message_status: string
          count: number
        }[]
      }
      get_message_counts_by_status: {
        Args: {
          p_user_id: string
        }
        Returns: {
          status: string
          count: number
        }[]
      }
      get_or_create_phone_number: {
        Args: {
          p_user_id: string
          p_phone_number: string
          p_twilio_sid: string
          p_monthly_cost: number
        }
        Returns: string
      }
      get_user_billing_cycle: {
        Args: {
          user_id: string
        }
        Returns: {
          cycle_start: string
          cycle_end: string
        }[]
      }
      get_user_plan_limits: {
        Args: {
          user_id: string
        }
        Returns: {
          message_limit: number
          campaign_limit: number
          can_buy_phone_numbers: boolean
          billing_cycle_start: string
          billing_cycle_end: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
