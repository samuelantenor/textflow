import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const UsageStats = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messageStats } = useQuery({
    queryKey: ['message_stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Get all message logs for the user's campaigns
      const { data: messageLogs, error: messageLogsError } = await supabase
        .from('message_logs')
        .select(`
          *,
          campaigns!inner(*)
        `)
        .eq('campaigns.user_id', session.user.id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (messageLogsError) throw messageLogsError;

      // Get user's plan limits
      const { data: planLimits, error: planLimitsError } = await supabase
        .rpc('get_user_plan_limits', {
          user_id: session.user.id
        });

      if (planLimitsError) throw planLimitsError;

      const limits = planLimits[0] || { message_limit: 20, campaign_limit: 3 };

      return {
        totalSent: messageLogs?.length || 0,
        delivered: messageLogs?.filter(log => log.status === 'delivered').length || 0,
        failed: messageLogs?.filter(log => log.status === 'failed').length || 0,
        pending: messageLogs?.filter(log => log.status === 'pending').length || 0,
        monthlyLimit: limits.message_limit
      };
    },
  });

  // Check and update subscription status when monthly limit is reached
  useEffect(() => {
    const updateSubscriptionStatus = async () => {
      if (messageStats?.monthlyLimit === 1000) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error updating subscription status:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update subscription status",
          });
          return;
        }

        // Invalidate subscription query to trigger a refresh
        queryClient.invalidateQueries({ queryKey: ['subscription'] });

        toast({
          title: "Subscription Updated",
          description: "Your subscription has been activated",
        });
      }
    };

    updateSubscriptionStatus();
  }, [messageStats?.monthlyLimit, queryClient, toast]);

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