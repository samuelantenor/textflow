
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BillingOverview = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['billing']);

  // Fetch subscription data
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleSubscribe = () => {
    navigate(`/${i18n.language}/pricing`);
  };

  const formatPlanType = (planType: string) => {
    switch (planType) {
      case 'paid_starter':
        return 'Starter';
      case 'paid_pro':
        return 'Pro';
      case 'free':
        return 'Free';
      default:
        return planType;
    }
  };

  const isFreePlan = subscription?.plan_type === 'free';

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
            <span className="font-medium">
              {formatPlanType(subscription?.plan_type || 'free')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
