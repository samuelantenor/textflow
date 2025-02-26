import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { GroupList } from "@/components/groups/GroupList";
import { FormsOverview } from "@/components/forms/FormsOverview";
import { PhoneNumbersList } from "@/components/phone-numbers/PhoneNumbersList";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t, i18n } = useTranslation(['dashboard']);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`/${i18n.language}/login`);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate(`/${i18n.language}/login`);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, i18n.language]);

  // Get current tab from URL
  const currentTab = searchParams.get("tab") || "overview";

  // Render content based on current tab
  const renderContent = () => {
    switch (currentTab) {
      case "overview":
        return <DashboardOverview />;
      case "campaigns":
        return <CampaignList />;
      case "groups":
        return <GroupList />;
      case "forms":
        return <FormsOverview />;
      case "phone-numbers":
        return <PhoneNumbersList />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="md:pl-0 transition-[padding] duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
