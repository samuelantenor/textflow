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

      // Format dates as ISO strings for Supabase
      const cycleStart = new Date(limits.billing_cycle_start).toISOString();
      const cycleEnd = new Date(limits.billing_cycle_end).toISOString();

      // Get all message logs for the user's campaigns within the billing cycle
      const { data: messageLogs, error: messageLogsError } = await supabase
        .from('message_logs')
        .select(`
          *,
          campaigns!inner(user_id)
        `)
        .eq('campaigns.user_id', session.user.id)
        .gte('created_at', cycleStart)
        .lte('created_at', cycleEnd);

      if (messageLogsError) {
        console.error('Error fetching message logs:', messageLogsError);
        throw messageLogsError;
      }

      console.log('Message logs:', messageLogs);
      console.log('Cycle start:', cycleStart);
      console.log('Cycle end:', cycleEnd);
      console.log('User ID:', session.user.id);

      const stats = {
        totalSent: messageLogs?.length || 0,
        delivered: messageLogs?.filter(log => log.status === 'delivered').length || 0,
        failed: messageLogs?.filter(log => log.status === 'failed').length || 0,
        pending: messageLogs?.filter(log => log.status === 'pending').length || 0,
        monthlyLimit: limits.message_limit,
        billingCycleStart: limits.billing_cycle_start,
        billingCycleEnd: limits.billing_cycle_end
      };

      console.log('Calculated stats:', stats);

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