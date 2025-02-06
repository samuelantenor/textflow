
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const StatsDisplay = () => {
  const { t } = useTranslation('dashboard');
  const { toast } = useToast();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No authenticated user found');

        // Use get_user_plan_limits to get subscription data
        const { data: limits, error: limitsError } = await supabase
          .rpc('get_user_plan_limits', {
            user_id: user.id
          });

        if (limitsError) {
          console.error('Error fetching limits:', limitsError);
          throw limitsError;
        }

        if (!limits || limits.length === 0) {
          throw new Error('No subscription data found');
        }

        const stats = limits[0];
        const totalMessages = stats.messages_sent_this_cycle || 0;
        const deliveredMessages = stats.delivered_messages_this_cycle || 0;
        const failedMessages = stats.failed_messages_this_cycle || 0;
        const pendingMessages = totalMessages - (deliveredMessages + failedMessages);
        
        // Calculate delivery rate
        const deliveryRate = totalMessages > 0 
          ? ((deliveredMessages / totalMessages) * 100).toFixed(1)
          : '0';

        return {
          total_messages: totalMessages,
          delivered_messages: deliveredMessages,
          failed_messages: failedMessages,
          pending_messages: pendingMessages,
          delivery_rate: deliveryRate,
          message_limit: stats.message_limit
        };
      } catch (error) {
        console.error('Error in analytics query:', error);
        toast({
          title: t('errors.loadingFailed'),
          description: t('errors.statsFailed'),
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 5000, // Regular polling every 5 seconds
  });

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
        {t('errors.loadingFailed')}
      </div>
    );
  }

  const stats = [
    {
      title: t('stats.deliveryRate.title'),
      value: analytics?.delivery_rate || 0,
      unit: "%",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      description: t('stats.deliveryRate.description', { total: analytics?.total_messages || 0 })
    },
    {
      title: t('stats.failedMessages.title'),
      value: analytics?.failed_messages || 0,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      description: t('stats.failedMessages.description')
    },
    {
      title: t('stats.pendingMessages.title'),
      value: analytics?.pending_messages || 0,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      description: t('stats.pendingMessages.description')
    },
    {
      title: t('stats.totalMessages.title'),
      value: analytics?.total_messages || 0,
      icon: MessageSquare,
      color: "text-primary-500",
      bgColor: "bg-primary-500/10",
      borderColor: "border-primary-500/20",
      description: t('stats.totalMessages.description')
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            "hover:shadow-lg hover:scale-[1.02]",
            "border-gray-800/50 bg-gray-900/50 backdrop-blur-sm",
            stat.borderColor
          )}
        >
          <div className={cn(
            "absolute top-0 right-0 w-32 h-32 transform translate-x-8 translate-y-[-50%] rounded-full blur-3xl opacity-20",
            stat.bgColor
          )} />
          
          <div className="relative p-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                <div className="flex items-baseline gap-1">
                  <h3 className={cn("text-2xl font-bold mt-1", stat.color)}>
                    {stat.value}
                  </h3>
                  {stat.unit && (
                    <span className="text-sm text-gray-500">{stat.unit}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsDisplay;
