import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StatsDisplay = () => {
  const { data: analytics } = useQuery({
    queryKey: ['campaign-analytics-summary'],
    queryFn: async () => {
      // First get all message logs to calculate actual delivery rate
      const { data: messageLogs, error: messageLogsError } = await supabase
        .from('message_logs')
        .select('status');

      if (messageLogsError) throw messageLogsError;
      
      // Calculate delivery rate from message logs
      const totalMessages = messageLogs.length;
      const deliveredMessages = messageLogs.filter(log => log.status === 'delivered').length;
      
      const deliveryRate = totalMessages > 0 
        ? ((deliveredMessages / totalMessages) * 100).toFixed(1) 
        : '0';

      return {
        delivery_rate: deliveryRate,
      };
    },
  });

  return (
    <div className="grid grid-cols-1 gap-4">
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
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsDisplay;