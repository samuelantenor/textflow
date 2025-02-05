import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const CampaignROI = () => {
  const { toast } = useToast();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('campaign_analytics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_analytics'
        },
        (payload) => {
          console.log('Change received!', payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to campaign analytics changes');
        }
        if (status === 'CHANNEL_ERROR') {
          toast({
            title: "Connection Error",
            description: "Failed to connect to real-time updates. Will retry automatically.",
            variant: "destructive",
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const { data: campaigns } = useQuery({
    queryKey: ['campaign-roi'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select(`
          cost,
          revenue,
          campaigns (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data.map(item => ({
        name: item.campaigns.name,
        cost: item.cost,
        revenue: item.revenue,
        roi: item.cost > 0 ? ((item.revenue - item.cost) / item.cost) * 100 : 0
      }));
    },
    refetchInterval: 5000, // Fallback polling if realtime fails
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Campaign ROI</h3>
      <div className="space-y-4">
        {campaigns?.map((campaign) => (
          <div key={campaign.name} className="flex justify-between items-center">
            <div className="flex-1">
              <p className="font-medium">{campaign.name}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Cost: ${campaign.cost}</span>
                <span>Revenue: ${campaign.revenue}</span>
              </div>
            </div>
            <div className={`text-sm font-medium ${campaign.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {campaign.roi.toFixed(1)}% ROI
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CampaignROI;