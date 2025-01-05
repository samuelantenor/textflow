import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsDisplay from "@/components/StatsDisplay";
import CampaignTable from "@/components/CampaignTable";
import DashboardHeader from "@/components/DashboardHeader";
import SubscriptionDialog from "@/components/SubscriptionDialog";

const Index = () => {
  const navigate = useNavigate();

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check subscription status
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return subscriptions;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardHeader onLogout={handleLogout} />
          <StatsDisplay />
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Campaigns</h2>
            <CampaignTable />
          </div>
        </div>
      </div>

      <SubscriptionDialog isOpen={!subscription} />
    </>
  );
};

export default Index;