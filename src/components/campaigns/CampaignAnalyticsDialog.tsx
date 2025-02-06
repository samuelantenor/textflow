
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Campaign } from "@/types/campaign";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface CampaignAnalyticsDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignAnalyticsDialog({
  campaign,
  open,
  onOpenChange,
}: CampaignAnalyticsDialogProps) {
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['campaign-analytics', campaign.id],
    queryFn: async () => {
      console.log('Fetching analytics for campaign:', campaign.id);
      
      // First get the analytics record
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('campaign_id', campaign.id)
        .single();

      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError);
        throw analyticsError;
      }

      // Also get message counts for detailed stats
      const { data: messageStats, error: statsError } = await supabase
        .from('message_logs')
        .select('status')
        .eq('campaign_id', campaign.id);

      if (statsError) {
        console.error('Error fetching message stats:', statsError);
        throw statsError;
      }

      const total = messageStats.length;
      const delivered = messageStats.filter(msg => msg.status === 'delivered').length;
      const failed = messageStats.filter(msg => msg.status === 'failed').length;
      const pending = messageStats.filter(msg => msg.status === 'pending').length;
      const deliveryRate = analyticsData?.delivery_rate || 0;

      return {
        ...analyticsData,
        messageStats: {
          total,
          delivered,
          failed,
          pending,
          deliveryRate
        }
      };
    },
    enabled: open,
    refetchInterval: 5000, // Poll every 5 seconds while dialog is open
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!open) return;

    console.log('Setting up real-time subscription for campaign:', campaign.id);
    
    const channel = supabase
      .channel('campaign-analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_analytics',
          filter: `campaign_id=eq.${campaign.id}`
        },
        (payload) => {
          console.log('Received analytics update:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_logs',
          filter: `campaign_id=eq.${campaign.id}`
        },
        (payload) => {
          console.log('Received message log update:', payload);
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [campaign.id, open, refetch]);

  const stats = analytics?.messageStats ? [
    {
      title: "Total Messages",
      value: analytics.messageStats.total,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Delivered",
      value: analytics.messageStats.delivered,
      subValue: `${analytics.messageStats.deliveryRate.toFixed(1)}%`,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Failed",
      value: analytics.messageStats.failed,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Pending",
      value: analytics.messageStats.pending,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    }
  ] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Campaign Analytics: {campaign.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="grid gap-4 grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[100px]" />
            ))}
          </div>
        ) : analytics ? (
          <div className="grid gap-4 grid-cols-2">
            {stats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 translate-y-[-50%] rounded-full blur-3xl opacity-20 ${stat.bgColor}`} />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                    {stat.subValue && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({stat.subValue})
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No analytics data available
          </div>
        )}

        <div className="flex items-center justify-center text-sm text-muted-foreground gap-2 mt-4">
          <RefreshCw className="h-4 w-4" />
          Updates automatically every 5 seconds
        </div>
      </DialogContent>
    </Dialog>
  );
}
