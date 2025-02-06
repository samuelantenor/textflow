
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/dateUtils";
import { Card } from "@/components/ui/card";

interface MessageStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  monthlyLimit: number;
  billingCycleStart: string;
  billingCycleEnd: string;
  messagesSentThisCycle: number;
  deliveredMessagesThisCycle: number;
  failedMessagesThisCycle: number;
}

export const UsageStats = () => {
  const { t } = useTranslation(['billing']);
  const { data: messageStats } = useQuery<MessageStats>({
    queryKey: ['message_stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Get user's message limits and usage
      const { data: limits, error: limitsError } = await supabase.rpc('get_user_plan_limits', {
        user_id: session.user.id
      });

      if (limitsError) throw limitsError;

      const stats: MessageStats = {
        totalSent: limits[0].messages_sent_this_cycle || 0,
        delivered: limits[0].delivered_messages_this_cycle || 0,
        failed: limits[0].failed_messages_this_cycle || 0,
        pending: (limits[0].messages_sent_this_cycle || 0) - 
                ((limits[0].delivered_messages_this_cycle || 0) + 
                 (limits[0].failed_messages_this_cycle || 0)),
        monthlyLimit: limits[0].message_limit,
        billingCycleStart: limits[0].billing_cycle_start,
        billingCycleEnd: limits[0].billing_cycle_end,
        messagesSentThisCycle: limits[0].messages_sent_this_cycle,
        deliveredMessagesThisCycle: limits[0].delivered_messages_this_cycle,
        failedMessagesThisCycle: limits[0].failed_messages_this_cycle
      };

      return stats;
    },
    refetchInterval: 5000, // Refresh every 5 seconds to keep counts up to date
  });

  const monthlyLimit = messageStats?.monthlyLimit || 20;
  const usagePercentage = ((messageStats?.messagesSentThisCycle || 0) / monthlyLimit) * 100;
  const isLimitReached = usagePercentage >= 100;
  const deliveryRate = messageStats?.totalSent ? 
    ((messageStats.delivered / messageStats.totalSent) * 100).toFixed(1) : 
    '0';

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">{t('usage.title')}</h2>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-muted-foreground">{t('usage.monthlyUsage')}</p>
            <p className="text-sm font-medium">
              {messageStats?.messagesSentThisCycle || 0} / {monthlyLimit} {t('usage.messages')}
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

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">{t('usage.delivered')}</p>
            <p className="text-2xl font-semibold text-green-500">
              {messageStats?.deliveredMessagesThisCycle || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {deliveryRate}% success rate
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">{t('usage.failed')}</p>
            <p className="text-2xl font-semibold text-red-500">
              {messageStats?.failedMessagesThisCycle || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">{t('usage.pending')}</p>
            <p className="text-2xl font-semibold text-yellow-500">
              {messageStats?.pending || 0}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
