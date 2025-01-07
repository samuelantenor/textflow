import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Send, Loader2, BarChart } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { EditCampaignDialog } from "../campaign/EditCampaignDialog";
import { CampaignAnalyticsDialog } from "./CampaignAnalyticsDialog";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // First delete associated message logs
      const { error: logsError } = await supabase
        .from('message_logs')
        .delete()
        .eq('campaign_id', campaign.id);

      if (logsError) throw logsError;

      // Then delete campaign analytics if they exist
      const { error: analyticsError } = await supabase
        .from('campaign_analytics')
        .delete()
        .eq('campaign_id', campaign.id);

      if (analyticsError) throw analyticsError;

      // Finally delete the campaign
      const { error: campaignError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id);

      if (campaignError) throw campaignError;

      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendCampaign = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: { campaignId: campaign.id }
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      toast({
        title: "Success",
        description: "Campaign sent successfully",
      });
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: "Failed to send campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{campaign.name}</CardTitle>
            <CardDescription className="mt-2">
              Created on {new Date(campaign.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              campaign.status === "sent"
                ? "bg-green-100 text-green-800 border-green-200"
                : campaign.status === "draft"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : "bg-muted"
            }
          >
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {campaign.message}
        </p>
        <div className="flex justify-end gap-2">
          {campaign.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendCampaign}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
          )}
          {campaign.status === 'sent' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalyticsDialog(true)}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <EditCampaignDialog
        campaign={campaign}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <CampaignAnalyticsDialog
        campaign={campaign}
        open={showAnalyticsDialog}
        onOpenChange={setShowAnalyticsDialog}
      />
    </Card>
  );
}
