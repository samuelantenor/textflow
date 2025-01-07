import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Campaign } from "@/types/campaign";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart } from "lucide-react";

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
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['campaign-analytics', campaign.id],
    queryFn: async () => {
      const { data: messageStats } = await supabase
        .from('message_logs')
        .select('status')
        .eq('campaign_id', campaign.id);

      if (!messageStats) return null;

      const total = messageStats.length;
      const delivered = messageStats.filter(msg => msg.status === 'delivered').length;
      const failed = messageStats.filter(msg => msg.status === 'failed').length;
      const pending = messageStats.filter(msg => msg.status === 'pending').length;

      return {
        total,
        delivered,
        failed,
        pending,
        deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
        failureRate: total > 0 ? (failed / total) * 100 : 0,
      };
    },
    enabled: open,
  });

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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Delivered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.delivered}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({analytics.deliveryRate.toFixed(1)}%)
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {analytics.failed}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({analytics.failureRate.toFixed(1)}%)
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics.pending}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No analytics data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}