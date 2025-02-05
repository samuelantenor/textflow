import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export const UsageStats = () => {
  const { data: messageStats } = useQuery({
    queryKey: ['message_stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Get user's plan limits and billing cycle
      const { data: planLimits, error: planLimitsError } = await supabase
        .rpc('get_user_plan_limits', {
          user_id: session.user.id
        });

      if (planLimitsError) throw planLimitsError;

      const limits = planLimits[0] || { 
        message_limit: 20, 
        campaign_limit: 3,
        billing_cycle_start: new Date(),
        billing_cycle_end: new Date()
      };

      // Get all message logs for the user within the billing cycle
      const { data: messageLogs, error: messageLogsError } = await supabase
        .from('message_logs')
        .select('status, created_at')
        .eq('user_id', session.user.id)
        .gte('created_at', limits.billing_cycle_start)
        .lte('created_at', limits.billing_cycle_end)
        .order('created_at', { ascending: false });

      if (messageLogsError) {
        console.error('Error fetching message logs:', messageLogsError);
        throw messageLogsError;
      }

      // Calculate metrics
      const totalMessages = messageLogs?.length || 0;
      const statusCounts = messageLogs?.reduce((acc, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const stats = {
        totalSent: totalMessages,
        delivered: statusCounts.delivered || 0,
        failed: statusCounts.failed || 0,
        pending: statusCounts.pending || 0,
        monthlyLimit: limits.message_limit,
        billingCycleStart: limits.billing_cycle_start,
        billingCycleEnd: limits.billing_cycle_end
      };

      return stats;
    },
    refetchInterval: 5000, // Refresh every 5 seconds to keep counts up to date
  });

  const monthlyLimit = messageStats?.monthlyLimit || 20;
  const usagePercentage = ((messageStats?.totalSent || 0) / monthlyLimit) * 100;
  const isLimitReached = usagePercentage >= 100;

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Usage Statistics</h2>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-muted-foreground">Monthly Usage</p>
            <p className="text-sm font-medium">
              {messageStats?.totalSent || 0} / {monthlyLimit} messages
            </p>
          </div>
          <Progress 
            value={usagePercentage} 
            className={isLimitReached ? "bg-red-200" : ""}
            indicatorClassName={isLimitReached ? "bg-red-500" : ""}
          />
          {isLimitReached && (
            <p className="text-sm text-red-500 mt-2">
              Monthly limit reached. Please upgrade your plan to send more messages.
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Billing cycle: {messageStats?.billingCycleStart ? (
              <>
                {format(new Date(messageStats.billingCycleStart), 'MMM d, yyyy')} - {format(new Date(messageStats.billingCycleEnd), 'MMM d, yyyy')}
              </>
            ) : 'Loading...'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Delivered</p>
            <p className="text-2xl font-semibold text-green-500">
              {messageStats?.delivered || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-semibold text-red-500">
              {messageStats?.failed || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};