import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsDisplay from "@/components/StatsDisplay";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Campaign } from "@/types/campaign";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export const DashboardOverview = () => {
  // Fetch recent campaigns
  const { data: recentCampaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['recent-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as Campaign[];
    },
  });

  // Fetch recent form submissions
  const { data: recentSubmissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['recent-form-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions')
        .select(`
          *,
          custom_forms (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Analytics Overview */}
      <div className="animate-slide-up">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Analytics Overview
        </h2>
        <StatsDisplay />
      </div>

      {/* Recent Campaigns */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Recent Campaigns
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingCampaigns ? (
            <>
              <Skeleton className="h-[200px] w-full rounded-xl bg-gray-800/50" />
              <Skeleton className="h-[200px] w-full rounded-xl bg-gray-800/50" />
              <Skeleton className="h-[200px] w-full rounded-xl bg-gray-800/50" />
            </>
          ) : recentCampaigns?.length === 0 ? (
            <Card className="col-span-3 p-8 text-center text-muted-foreground bg-gray-900/50 border-gray-800/50 rounded-xl backdrop-blur-sm
              hover:shadow-glow transition-all duration-300">
              No campaigns created yet
            </Card>
          ) : (
            recentCampaigns?.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))
          )}
        </div>
      </div>

      {/* Recent Form Submissions */}
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Recent Form Submissions
        </h2>
        <Card className="bg-gray-900/50 border-gray-800/50 rounded-xl backdrop-blur-sm
          hover:shadow-glow transition-all duration-300">
          <ScrollArea className="h-[400px] w-full">
            {isLoadingSubmissions ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-16 w-full rounded-xl bg-gray-800/50" />
                <Skeleton className="h-16 w-full rounded-xl bg-gray-800/50" />
                <Skeleton className="h-16 w-full rounded-xl bg-gray-800/50" />
              </div>
            ) : recentSubmissions?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No form submissions yet
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {recentSubmissions?.map((submission, index) => (
                  <Card 
                    key={submission.id} 
                    className="p-4 bg-black/40 border-gray-800/30 rounded-xl backdrop-blur-sm
                      hover:shadow-card hover:border-gray-700/50 transition-all duration-300
                      animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white">
                          {submission.custom_forms?.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Submitted on {new Date(submission.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-sm space-y-1">
                        {Object.entries(submission.data).map(([key, value]) => (
                          <div key={key} className="text-right">
                            <span className="font-medium text-gray-300">{key}:</span>{" "}
                            <span className="text-gray-400">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};
