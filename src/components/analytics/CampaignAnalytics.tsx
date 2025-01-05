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
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('*');

      if (error) throw error;
      
      // Calculate totals
      const totals = data.reduce((acc, curr) => {
        acc.total_messages++;
        acc.delivered += curr.delivery_rate;
        acc.failed += (100 - curr.delivery_rate);
        acc.response_rate += curr.open_rate;
        return acc;
      }, {
        total_messages: 0,
        delivered: 0,
        failed: 0,
        response_rate: 0,
        queued: 0
      });

      // Calculate averages
      const count = data.length || 1;
      return {
        total_messages: totals.total_messages,
        delivery_rate: (totals.delivered / count).toFixed(1),
        failed_messages: Math.round(totals.failed / 100),
        response_rate: (totals.response_rate / count).toFixed(1),
        delivery_status: {
          delivered: Math.round(totals.delivered / count),
          failed: Math.round(totals.failed / count),
          queued: totals.queued
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
            <span>{analytics?.delivery_status?.failed || 0} ({100 - (analytics?.delivery_rate || 0)}%)</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>Queued</span>
            </div>
            <span>{analytics?.delivery_status?.queued || 0} (0%)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};