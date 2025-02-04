import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsDisplay from "@/components/StatsDisplay";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Campaign } from "@/types/campaign";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Users, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <Button asChild className="bg-primary-500 hover:bg-primary-600 text-white">
          <Link to="/dashboard?tab=campaigns" className="flex items-center gap-2">
            New Campaign <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="animate-slide-up">
        <StatsDisplay />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Recent Campaigns Section */}
        <div className="lg:col-span-3 space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Recent Campaigns
            </h2>
            <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
              <Link to="/dashboard?tab=campaigns" className="flex items-center gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-6">
            {isLoadingCampaigns ? (
              <>
                <Skeleton className="h-[120px] w-full rounded-xl bg-gray-800/50" />
                <Skeleton className="h-[120px] w-full rounded-xl bg-gray-800/50" />
                <Skeleton className="h-[120px] w-full rounded-xl bg-gray-800/50" />
              </>
            ) : recentCampaigns?.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground bg-gray-900/50 border-gray-800/50 rounded-xl backdrop-blur-sm
                hover:shadow-glow transition-all duration-300">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-lg font-medium text-gray-400">No campaigns created yet</p>
                <p className="text-gray-500 mt-2">Create your first campaign to get started</p>
              </Card>
            ) : (
              recentCampaigns?.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))
            )}
          </div>
        </div>

        {/* Recent Form Submissions Section */}
        <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Recent Submissions
            </h2>
            <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
              <Link to="/dashboard?tab=forms" className="flex items-center gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card className="bg-gray-900/50 border-gray-800/50 rounded-xl backdrop-blur-sm
            hover:shadow-glow transition-all duration-300">
            <ScrollArea className="h-[600px]">
              {isLoadingSubmissions ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-20 w-full rounded-xl bg-gray-800/50" />
                  <Skeleton className="h-20 w-full rounded-xl bg-gray-800/50" />
                  <Skeleton className="h-20 w-full rounded-xl bg-gray-800/50" />
                </div>
              ) : recentSubmissions?.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg font-medium text-gray-400">No form submissions yet</p>
                  <p className="text-gray-500 mt-2">Form submissions will appear here</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {recentSubmissions?.map((submission, index) => (
                    <Card 
                      key={submission.id} 
                      className="p-4 bg-black/40 border-gray-800/30 rounded-xl backdrop-blur-sm
                        hover:bg-black/60 hover:border-gray-700/50 transition-all duration-300
                        animate-fade-in group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                            {submission.custom_forms?.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(submission.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-sm space-y-1 text-right">
                          {Object.entries(submission.data).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-end gap-2">
                              <span className="font-medium text-gray-300">{key}:</span>
                              <span className="text-gray-400 truncate max-w-[200px]">{String(value)}</span>
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
    </div>
  );
};
