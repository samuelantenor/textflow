import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useToast } from "@/hooks/use-toast";

const COLORS = {
  delivered: "#22c55e",  // green
  failed: "#ef4444",     // red
  pending: "#f59e0b"     // amber
};

const StatsDisplay = () => {
  const { toast } = useToast();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['campaign-analytics-summary'],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user found');

        console.log('Fetching message logs for user:', user.id);

        // Get message count by status
        const { data: messageCountByStatus, error: countError } = await supabase
          .from('message_logs')
          .select('status, count', { count: 'exact' })
          .eq('user_id', user.id)
          .then(({ data, error }) => {
            if (error) throw error;
            return {
              data: data?.reduce((acc, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>),
              error: null
            };
          });

        if (countError) {
          console.error('Error counting messages:', countError);
          throw countError;
        }

        console.log('Message counts by status:', messageCountByStatus);

        // Calculate total messages and status counts
        const statusCounts = {
          delivered: messageCountByStatus?.delivered || 0,
          failed: messageCountByStatus?.failed || 0,
          pending: messageCountByStatus?.pending || 0
        };

        const totalMessages = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
        
        // Calculate delivery rate
        const deliveryRate = totalMessages > 0 
          ? ((statusCounts.delivered / totalMessages) * 100).toFixed(1)
          : '0';

        // Prepare chart data
        const chartData = [
          { name: 'Delivered', value: statusCounts.delivered, color: COLORS.delivered },
          { name: 'Failed', value: statusCounts.failed, color: COLORS.failed },
          { name: 'Pending', value: statusCounts.pending, color: COLORS.pending }
        ];

        return {
          delivery_rate: deliveryRate,
          chart_data: chartData,
          total_messages: totalMessages,
          status_counts: statusCounts
        };
      } catch (error) {
        console.error('Error in analytics query:', error);
        toast({
          title: "Error loading analytics",
          description: "There was a problem loading your campaign analytics. Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 5000, // Regular polling every 5 seconds
  });

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="p-4 text-center text-red-500">
        Error loading analytics. Please try refreshing the page.
      </div>
    );
  }

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