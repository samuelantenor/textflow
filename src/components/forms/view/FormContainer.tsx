import { Card } from "@/components/ui/card";
import { LandingPage } from "@/integrations/supabase/types";

interface FormContainerProps {
  landingPage: LandingPage;
  children: React.ReactNode;
}

export function FormContainer({ landingPage, children }: FormContainerProps) {
  const containerStyle = {
    backgroundColor: landingPage.background_color || '#ffffff',
    fontFamily: landingPage.font_family,
  };

  return (
    <div className="min-h-screen py-12 px-4" style={containerStyle}>
      <div className="max-w-2xl mx-auto space-y-6">
        {landingPage.logo_url && (
          <div className="flex justify-center mb-8">
            <img
              src={landingPage.logo_url}
              alt="Form Logo"
              className="h-12 object-contain"
            />
          </div>
        )}
        <Card className="p-6">
          {children}
        </Card>
      </div>
    </div>
  );
}