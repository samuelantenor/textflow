import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, MessageSquare, Users, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <StatsDisplay />
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => document.querySelector('[value="campaigns"]')?.click()}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Campaigns</h3>
                      <p className="text-sm text-muted-foreground">Create and manage campaigns</p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => document.querySelector('[value="groups"]')?.click()}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Groups</h3>
                      <p className="text-sm text-muted-foreground">Manage contact groups</p>
                    </div>
                  </div>
                </Card>

                <Card 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => document.querySelector('[value="analytics"]')?.click()}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Analytics</h3>
                      <p className="text-sm text-muted-foreground">View campaign performance</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Campaigns</h2>
                <CreateCampaignDialog />
              </div>
              <CampaignList />
            </TabsContent>

            <TabsContent value="groups">
              <GroupList />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Campaign Performance</h2>
                    <CampaignChart />
                  </Card>
                </div>
                <div>
                  <CampaignROI />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;