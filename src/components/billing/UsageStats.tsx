import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const UsageStats = () => {
  const { data: analytics } = useQuery({
    queryKey: ['campaign_analytics'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('campaign_analytics')
        .select(`
          *,
          campaigns!inner(*)
        `)
        .eq('campaigns.user_id', session.user.id);

      if (error) throw error;
      return data;
    },
  });

  const totalSMSSent = analytics?.reduce((sum, record) => sum + record.delivery_rate, 0) || 0;
  const monthlyLimit = 1000; // This should come from your subscription plan

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">Usage Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-muted-foreground">SMS Credits</p>
          <p className="text-2xl font-semibold">{totalSMSSent}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Monthly Limit</p>
          <p className="text-2xl font-semibold">{monthlyLimit}</p>
        </div>
      </div>
    </div>
  );
};