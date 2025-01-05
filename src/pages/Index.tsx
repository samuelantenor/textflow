import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CreateCampaignButton from "@/components/CreateCampaignButton";
import StatsDisplay from "@/components/StatsDisplay";
import CampaignTable from "@/components/CampaignTable";
import SubscribeButton from "@/components/SubscribeButton";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">SMS Campaigns</h1>
          <div className="flex gap-4">
            <SubscribeButton />
            <CreateCampaignButton />
          </div>
        </div>
        
        <StatsDisplay />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Campaigns</h2>
          <CampaignTable />
        </div>
      </div>
    </div>
  );
};

export default Index;