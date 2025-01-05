import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignListItem } from "./CampaignListItem";
import { Campaign } from "./types";
import { CreateCampaignDialog } from "./CreateCampaignDialog";
import { LayoutGrid } from "lucide-react";

export function CampaignList() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!campaigns?.length) {
    return (
      <div className="text-center space-y-4 p-8">
        <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto" />
        <div className="text-xl font-semibold">No campaigns yet</div>
        <p className="text-muted-foreground">
          Create your first campaign to get started with SMS marketing.
        </p>
        <CreateCampaignDialog />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Campaigns</h2>
        <CreateCampaignDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <CampaignListItem key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}