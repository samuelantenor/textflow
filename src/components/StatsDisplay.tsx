import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  delivered: "#22c55e",  // green
  failed: "#ef4444",     // red
  pending: "#f59e0b"     // amber
};

const StatsDisplay = () => {
  const { data: analytics } = useQuery({
    queryKey: ['campaign-analytics-summary'],
    queryFn: async () => {
      // Get all message logs for the user, regardless of campaign status
      const { data: messageLogs, error: messageLogsError } = await supabase
        .from('message_logs')
        .select('status, created_at')
        .order('created_at', { ascending: false });

      if (messageLogsError) throw messageLogsError;
      
      // Calculate delivery metrics
      const totalMessages = messageLogs?.length || 0;
      const statusCounts = messageLogs?.reduce((acc, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const deliveryRate = totalMessages > 0 
        ? ((statusCounts.delivered || 0) / totalMessages * 100).toFixed(1) 
        : '0';

      // Prepare data for pie chart
      const chartData = [
        { name: 'Delivered', value: statusCounts.delivered || 0, color: COLORS.delivered },
        { name: 'Failed', value: statusCounts.failed || 0, color: COLORS.failed },
        { name: 'Pending', value: statusCounts.pending || 0, color: COLORS.pending }
      ];

      return {
        delivery_rate: deliveryRate,
        chart_data: chartData,
        total_messages: totalMessages,
        status_counts: statusCounts
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds to keep counts up to date
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="campaign-card p-6 hover:scale-[1.02] transition-transform duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Delivery Rate</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold">{analytics?.delivery_rate || 0}</h3>
              <span className="text-sm text-muted-foreground ml-1">%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Total Messages: {analytics?.total_messages || 0}
            </p>
          </div>
        </div>
      </Card>

      <Card className="campaign-card p-6 hover:scale-[1.02] transition-transform duration-200">
        <h3 className="text-lg font-semibold mb-4">Message Status Distribution</h3>
        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics?.chart_data || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics?.chart_data?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default StatsDisplay;