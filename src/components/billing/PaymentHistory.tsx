import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "lucide-react";
import { format } from "date-fns";

export const PaymentHistory = () => {
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
        <h2 className="text-lg font-semibold mb-6">Payment History</h2>
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
        <h2 className="text-lg font-semibold mb-6">Payment History</h2>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Receipt className="h-12 w-12 mb-4" />
          <p>No payment history available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Payment History</h2>
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
                {format(new Date(payment.payment_date), 'PPP')}
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