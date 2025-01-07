import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { GroupList } from "@/components/groups/GroupList";
import { useQuery } from "@tanstack/react-query";
import { CampaignAnalytics } from "@/components/analytics/CampaignAnalytics";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { FormsOverview } from "@/components/forms/FormsOverview";
import { PhoneNumbersList } from "@/components/phone-numbers/PhoneNumbersList";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const sessionId = searchParams.get("session_id");
  const [activeTab, setActiveTab] = useState("overview");

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
        title: "Welcome to FlowText!",
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
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="phone-numbers">Phone Numbers</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <DashboardOverview setActiveTab={setActiveTab} />
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

            <TabsContent value="forms">
              <FormsOverview />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold">Campaign Analytics</h2>
                <CampaignAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="phone-numbers">
              <PhoneNumbersList />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
