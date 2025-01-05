import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { GroupList } from "@/components/groups/GroupList";
import { useQuery } from "@tanstack/react-query";
import StatsDisplay from "@/components/StatsDisplay";
import CampaignChart from "@/components/analytics/CampaignChart";
import CampaignROI from "@/components/analytics/CampaignROI";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!subscription) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">SMS Campaigns</h1>
            </div>
            <div className="flex items-center gap-4">
              <CreateCampaignDialog />
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-muted"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <StatsDisplay />
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Campaign Performance</h2>
                <CampaignChart />
              </div>
              
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Contact Groups</h2>
                <GroupList />
              </div>
              
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Campaigns</h2>
                <CampaignList />
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Campaign ROI</h2>
                <CampaignROI />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;