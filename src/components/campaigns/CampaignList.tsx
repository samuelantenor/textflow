
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CreateCampaignButton } from "@/components/CreateCampaignButton";
import { CampaignCard } from "./CampaignCard";
import { Campaign } from "@/types/campaign";
import { MessageSquare } from "lucide-react";
import { useCampaignSubscription } from "@/hooks/useCampaignSubscription";

export function CampaignList() {
  // Set up real-time subscription
  useCampaignSubscription();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    },
    staleTime: 1000, // Consider data fresh for 1 second
    refetchOnMount: true // Always refetch when component mounts
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <CreateCampaignButton />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!campaigns?.length) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Campaigns</h2>
          <CreateCampaignButton />
        </div>
        <Card className="p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No campaigns yet</h3>
            <p className="text-muted-foreground">
              Create your first campaign to start sending messages to your contacts.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaigns ({campaigns.length})</h2>
        <CreateCampaignButton />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}
