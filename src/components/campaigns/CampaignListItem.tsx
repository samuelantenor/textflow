import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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

interface CampaignListItemProps {
  campaign: Campaign;
}

export function CampaignListItem({ campaign }: CampaignListItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
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
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash className="h-4 w-4 mr-2" />
              Delete
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
            {format(new Date(campaign.scheduled_for), "MMM d, yyyy")}
          </Badge>
        )}
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-sm text-muted-foreground">
          Created {format(new Date(campaign.created_at), "MMM d, yyyy")}
        </span>
        {campaign.status === 'draft' && (
          <Button size="sm" className="gap-2">
            <Send className="w-4 h-4" />
            Send
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