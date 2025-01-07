import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Campaign } from "./types";
import { EditCampaignDialog } from "./EditCampaignDialog";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { CampaignActionsMenu } from "./CampaignActionsMenu";
import { CampaignScheduleBadge } from "./CampaignScheduleBadge";

interface CampaignListItemProps {
  campaign: Campaign;
}

export function CampaignListItem({ campaign }: CampaignListItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaign.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    toast({
      title: "Success",
      description: "Campaign deleted successfully",
    });
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: { campaignId: campaign.id },
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
      setIsSending(false);
    }
  };

  return (
    <div className="campaign-card rounded-lg border p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{campaign.name}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {campaign.message}
          </p>
        </div>
        <CampaignActionsMenu 
          onEdit={() => setShowEditDialog(true)}
          onDelete={handleDelete}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CampaignStatusBadge status={campaign.status} />
        {campaign.scheduled_for && (
          <CampaignScheduleBadge scheduledFor={campaign.scheduled_for} />
        )}
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-sm text-muted-foreground">
          Created {format(new Date(campaign.created_at), "MMM d, yyyy")}
        </span>
        {campaign.status === 'draft' && (
          <Button 
            size="sm" 
            className="gap-2"
            onClick={handleSend}
            disabled={isSending}
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        )}
      </div>

      {showEditDialog && (
        <EditCampaignDialog
          campaign={campaign}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </div>
  );
}