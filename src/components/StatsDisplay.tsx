import { BarChart3, MessageSquare, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StatsDisplay = () => {
  const { data: analytics } = useQuery({
    queryKey: ['campaign-analytics-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('delivery_rate, open_rate, click_rate, cost, revenue');

      if (error) throw error;
      
      // Calculate averages
      const summary = data.reduce((acc, curr) => {
        acc.delivery_rate += curr.delivery_rate;
        acc.open_rate += curr.open_rate;
        acc.click_rate += curr.click_rate;
        acc.total_cost += curr.cost;
        acc.total_revenue += curr.revenue;
        return acc;
      }, {
        delivery_rate: 0,
        open_rate: 0,
        click_rate: 0,
        total_cost: 0,
        total_revenue: 0
      });

      const count = data.length || 1;
      return {
        avg_delivery_rate: (summary.delivery_rate / count).toFixed(1),
        avg_open_rate: (summary.open_rate / count).toFixed(1),
        total_cost: summary.total_cost.toFixed(2),
        total_revenue: summary.total_revenue.toFixed(2),
        roi: summary.total_cost > 0 
          ? (((summary.total_revenue - summary.total_cost) / summary.total_cost) * 100).toFixed(1)
          : 0
      };
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="campaign-card p-6">
        <div className="flex items-center gap-4">
          <MessageSquare className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Avg. Delivery Rate</p>
            <h3 className="text-2xl font-bold">{analytics?.avg_delivery_rate || 0}%</h3>
          </div>
        </div>
      </Card>
      
      <Card className="campaign-card p-6">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Avg. Open Rate</p>
            <h3 className="text-2xl font-bold">{analytics?.avg_open_rate || 0}%</h3>
          </div>
        </div>
      </Card>
      
      <Card className="campaign-card p-6">
        <div className="flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">ROI</p>
            <h3 className="text-2xl font-bold">{analytics?.roi || 0}%</h3>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsDisplay;