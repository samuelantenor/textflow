import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignListItem } from "./CampaignListItem";
import { SendTestMessageDialog } from "../campaign/SendTestMessageDialog";
import type { Campaign } from "@/types/campaign";

export function CampaignList() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure the status is either 'draft' or 'sent'
      return (data as any[]).map(campaign => ({
        ...campaign,
        status: campaign.status as Campaign['status']
      })) as Campaign[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          <SendTestMessageDialog />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (!campaigns?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No campaigns found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Campaigns</h2>
        <div className="space-x-2">
          <SendTestMessageDialog />
        </div>
      </div>
      {campaigns.map((campaign) => (
        <CampaignListItem key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}