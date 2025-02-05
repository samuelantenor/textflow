import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/dateUtils";

interface MessageStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  monthlyLimit: number;
  billingCycleStart: string;
  billingCycleEnd: string;
}

export const UsageStats = () => {
  const { t } = useTranslation(['billing']);
  const { data: messageStats } = useQuery<MessageStats>({
    queryKey: ['message_stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Get user's message limits
      const { data: limits, error: limitsError } = await supabase.rpc('get_user_plan_limits', {
        user_id: session.user.id
      });

      if (limitsError) throw limitsError;

      // Get message counts
      const { data: messages, error: messagesError } = await supabase
        .from('message_logs')
        .select('status')
        .eq('user_id', session.user.id)
        .gte('created_at', limits[0].billing_cycle_start)
        .lte('created_at', limits[0].billing_cycle_end);

      if (messagesError) throw messagesError;

      // Calculate totals
      const totalMessages = messages?.length || 0;
      const statusCounts = messages?.reduce((acc: Record<string, number>, msg) => {
        acc[msg.status] = (acc[msg.status] || 0) + 1;
        return acc;
      }, {});

      const stats: MessageStats = {
        totalSent: totalMessages,
        delivered: statusCounts?.delivered || 0,
        failed: statusCounts?.failed || 0,
        pending: statusCounts?.pending || 0,
        monthlyLimit: limits[0].message_limit,
        billingCycleStart: limits[0].billing_cycle_start,
        billingCycleEnd: limits[0].billing_cycle_end
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
      <h2 className="text-lg font-semibold mb-6">{t('usage.title')}</h2>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-muted-foreground">{t('usage.monthlyUsage')}</p>
            <p className="text-sm font-medium">
              {messageStats?.totalSent || 0} / {monthlyLimit} {t('usage.messages')}
            </p>
          </div>
          <Progress 
            value={usagePercentage} 
            className={isLimitReached ? "bg-red-200" : ""}
            indicatorClassName={isLimitReached ? "bg-red-500" : ""}
          />
          {isLimitReached && (
            <p className="text-sm text-red-500 mt-2">
              {t('usage.limitReached')}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {t('usage.billingCycle')} {messageStats?.billingCycleStart ? (
              <>
                {formatDate(messageStats.billingCycleStart)} - {formatDate(messageStats.billingCycleEnd)}
              </>
            ) : 'Loading...'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('usage.delivered')}</p>
            <p className="text-2xl font-semibold text-green-500">
              {messageStats?.delivered || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('usage.failed')}</p>
            <p className="text-2xl font-semibold text-red-500">
              {messageStats?.failed || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};