import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  BarChart
} from "lucide-react";

export const CampaignAnalytics = () => {
  const { data: analytics } = useQuery({
    queryKey: ['campaign-analytics'],
    queryFn: async () => {
      const { data: messageData, error: messageError } = await supabase
        .from('message_logs')
        .select('status, campaign_id');

      if (messageError) throw messageError;

      // Group messages by campaign and calculate stats
      const campaignStats = messageData.reduce((acc, msg) => {
        if (!acc[msg.campaign_id]) {
          acc[msg.campaign_id] = {
            total: 0,
            delivered: 0,
            failed: 0,
            pending: 0
          };
        }
        
        acc[msg.campaign_id].total++;
        switch (msg.status) {
          case 'delivered':
            acc[msg.campaign_id].delivered++;
            break;
          case 'failed':
            acc[msg.campaign_id].failed++;
            break;
          default:
            acc[msg.campaign_id].pending++;
        }
        
        return acc;
      }, {});

      // Calculate overall stats
      const totalStats = Object.values(campaignStats).reduce((acc: any, curr: any) => {
        acc.total_messages += curr.total;
        acc.delivered += curr.delivered;
        acc.failed += curr.failed;
        acc.pending += curr.pending;
        return acc;
      }, { total_messages: 0, delivered: 0, failed: 0, pending: 0 });

      return {
        total_messages: totalStats.total_messages,
        delivery_rate: totalStats.total_messages > 0 
          ? ((totalStats.delivered / totalStats.total_messages) * 100).toFixed(1)
          : 0,
        failed_messages: totalStats.failed,
        response_rate: totalStats.total_messages > 0
          ? ((totalStats.delivered / totalStats.total_messages) * 100).toFixed(1)
          : 0,
        delivery_status: {
          delivered: totalStats.delivered,
          failed: totalStats.failed,
          queued: totalStats.pending
        }
      };
    },
  });

  const stats = [
    {
      title: "Total Messages",
      value: analytics?.total_messages || 0,
      icon: MessageSquare
    },
    {
      title: "Delivery Rate",
      value: `${analytics?.delivery_rate || 0}%`,
      icon: CheckCircle
    },
    {
      title: "Failed Messages",
      value: analytics?.failed_messages || 0,
      icon: XCircle
    },
    {
      title: "Response Rate",
      value: `${analytics?.response_rate || 0}%`,
      icon: BarChart
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Message Delivery Status</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Delivered</span>
            </div>
            <span>{analytics?.delivery_status?.delivered || 0} ({analytics?.delivery_rate || 0}%)</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Failed</span>
            </div>
            <span>{analytics?.delivery_status?.failed || 0} ({analytics?.failed_messages || 0})</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>Queued</span>
            </div>
            <span>{analytics?.delivery_status?.queued || 0}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};