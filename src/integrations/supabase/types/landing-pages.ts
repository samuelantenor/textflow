export interface LandingPage {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  welcome_message: string | null;
  template_id: string;
  primary_color: string;
  font_family: string;
  logo_url: string | null;
  published: boolean;
  background_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface LandingPageInsert extends Omit<LandingPage, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LandingPageUpdate extends Partial<LandingPageInsert> {}