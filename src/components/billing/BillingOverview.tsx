
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  plan_type: string;
  monthly_message_limit: number;
  campaign_limit: number;
  has_been_paid: boolean;
}

export const BillingOverview = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['billing']);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data as Subscription;
    },
  });

  const handleSubscribe = () => {
    navigate(`/${i18n.language}/pricing`);
  };

  const isFreePlan = subscription?.plan_type === 'free';

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">{t('overview.title')}</h2>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">{t('overview.title')}</h2>
      
      {isFreePlan ? (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-muted-foreground text-center">
            {t('overview.upgradeMessage')}
          </p>
          <Button 
            onClick={handleSubscribe}
            className="bg-primary hover:bg-primary/90 w-full"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {t('overview.subscribeNow')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('overview.plan')}</span>
            <span className="font-medium capitalize">{subscription?.plan_type}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('overview.status')}</span>
            <span className="font-medium capitalize">{subscription?.status}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('overview.monthlyMessageLimit')}</span>
            <span className="font-medium">{subscription?.monthly_message_limit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('overview.campaignLimit')}</span>
            <span className="font-medium">{subscription?.campaign_limit}</span>
          </div>
        </div>
      )}
    </div>
  );
};
