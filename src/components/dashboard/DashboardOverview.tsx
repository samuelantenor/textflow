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
    <div className="space-y-8">
      {/* Analytics Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Analytics Overview</h2>
        <StatsDisplay />
      </div>

      {/* Recent Campaigns */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Campaigns</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingCampaigns ? (
            <>
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </>
          ) : recentCampaigns?.length === 0 ? (
            <Card className="col-span-3 p-6 text-center text-muted-foreground">
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
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Form Submissions</h2>
        <Card>
          <ScrollArea className="h-[300px] w-full">
            {isLoadingSubmissions ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentSubmissions?.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No form submissions yet
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {recentSubmissions?.map((submission) => (
                  <Card key={submission.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {submission.custom_forms?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted on {new Date(submission.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-sm">
                        {Object.entries(submission.data).map(([key, value]) => (
                          <div key={key} className="text-right">
                            <span className="font-medium">{key}:</span>{" "}
                            {String(value)}
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
