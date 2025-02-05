import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { useTranslation } from "react-i18next";

export const PaymentHistory = () => {
  const { t } = useTranslation(['billing']);
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payment_history'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">{t('payments.title')}</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded"></div>
          <div className="h-12 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!payments?.length) {
    return (
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">{t('payments.title')}</h2>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Receipt className="h-12 w-12 mb-4" />
          <p>{t('payments.noPayments')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">{t('payments.title')}</h2>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">
                {payment.amount} {payment.currency}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(payment.payment_date)}
              </p>
            </div>
            <div className="text-right">
              <p className="capitalize text-sm font-medium">{payment.status}</p>
              {payment.payment_method && (
                <p className="text-sm text-muted-foreground capitalize">
                  {payment.payment_method}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};