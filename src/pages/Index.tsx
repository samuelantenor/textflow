import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CreateCampaignButton from "@/components/CreateCampaignButton";
import StatsDisplay from "@/components/StatsDisplay";
import CampaignTable from "@/components/CampaignTable";
import SubscribeButton from "@/components/SubscribeButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

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

  if (!subscription) {
    return (
      <div className="min-h-screen p-8">
        <div className="absolute top-4 right-4">
          <UserMenu onLogout={handleLogout} />
        </div>
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-3xl font-bold">Subscribe to Access SMS Campaigns</h1>
          <p className="text-muted-foreground">
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
          <div className="flex items-center gap-4">
            <CreateCampaignButton />
            <UserMenu onLogout={handleLogout} />
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

const UserMenu = ({ onLogout }: { onLogout: () => Promise<void> }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Index;