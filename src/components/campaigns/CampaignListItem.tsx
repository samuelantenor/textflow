import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/utils/dateUtils";
import { MoreVertical, Trash, Edit, Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Campaign } from "./types";
import { EditCampaignDialog } from "./EditCampaignDialog";
import { useTranslation } from "react-i18next";

interface CampaignListItemProps {
  campaign: Campaign;
}

export function CampaignListItem({ campaign }: CampaignListItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation("campaigns");

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

      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: t("success.deleted.title"),
        description: t("success.deleted.description"),
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: t("errors.delete"),
        description: t("errors.campaignDeleteFailed"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete} 
              className="text-red-600"
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={getStatusColor(campaign.status)}>
          {campaign.status}
        </Badge>
        {campaign.scheduled_for && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(campaign.scheduled_for)}
          </Badge>
        )}
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-sm text-muted-foreground">
          Created {formatDate(campaign.created_at)}
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
