import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const CampaignChart = () => {
  const { data: analytics } = useQuery({
    queryKey: ['campaign-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select(`
          *,
          campaigns (
            name,
            created_at
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const chartData = analytics?.map((item) => ({
    name: item.campaigns.name,
    "Delivery Rate": item.delivery_rate,
    "Open Rate": item.open_rate,
    "Click Rate": item.click_rate,
  })) || [];

  const config = {
    "Delivery Rate": {
      theme: {
        light: "#22c55e",
        dark: "#22c55e",
      },
    },
    "Open Rate": {
      theme: {
        light: "#3b82f6",
        dark: "#3b82f6",
      },
    },
    "Click Rate": {
      theme: {
        light: "#f59e0b",
        dark: "#f59e0b",
      },
    },
  };

  return (
    <ChartContainer className="aspect-[4/3]" config={config}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.substring(0, 15) + "..."}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="Delivery Rate"
          stackId="1"
          stroke="var(--color-Delivery Rate)"
          fill="var(--color-Delivery Rate)"
          fillOpacity={0.2}
        />
        <Area
          type="monotone"
          dataKey="Open Rate"
          stackId="2"
          stroke="var(--color-Open Rate)"
          fill="var(--color-Open Rate)"
          fillOpacity={0.2}
        />
        <Area
          type="monotone"
          dataKey="Click Rate"
          stackId="3"
          stroke="var(--color-Click Rate)"
          fill="var(--color-Click Rate)"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ChartContainer>
  );
};

export default CampaignChart;