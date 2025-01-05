import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { GroupList } from "@/components/groups/GroupList";
import { useQuery } from "@tanstack/react-query";
import StatsDisplay from "@/components/StatsDisplay";
import CampaignChart from "@/components/analytics/CampaignChart";
import CampaignROI from "@/components/analytics/CampaignROI";
import { LandingPageBuilder } from "@/components/landing-page/LandingPageBuilder";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const sessionId = searchParams.get("session_id");

  // Check authentication
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

  // Show welcome message if coming from successful payment
  useEffect(() => {
    if (sessionId) {
      toast({
        title: "Welcome to SMS Campaigns!",
        description: "Your subscription has been activated successfully.",
      });
      // Clean up the URL
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, [sessionId, toast]);

  // Fetch subscription status
  const { data: subscription, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!subscription) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">SMS Campaigns</h1>
          <div className="flex items-center gap-4">
            <CreateCampaignDialog />
            <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="grid gap-8">
          <StatsDisplay />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <CampaignChart />
            </div>
            <div>
              <CampaignROI />
            </div>
          </div>
          <GroupList />
          <CampaignList />
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Landing Page Builder</h2>
            <LandingPageBuilder />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;