import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CreateCampaignButton from "@/components/CreateCampaignButton";
import StatsDisplay from "@/components/StatsDisplay";
import CampaignTable from "@/components/CampaignTable";
import SubscribeButton from "@/components/SubscribeButton";

const Index = () => {
  const navigate = useNavigate();

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

  useEffect(() => {
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => authSubscription.unsubscribe();
  }, [navigate]);

  if (isLoadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-3xl font-bold">Subscribe to Access SMS Campaigns</h1>
          <p className="text-gray-600">
            To access the SMS campaign features, you need an active subscription.
          </p>
          <div className="flex justify-center">
            <SubscribeButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">SMS Campaigns</h1>
          <div className="flex gap-4">
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