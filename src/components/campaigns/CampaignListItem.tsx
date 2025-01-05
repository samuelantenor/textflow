import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreVertical, Trash, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex-1">
        <h3 className="font-medium">{campaign.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{campaign.message}</p>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <span>Status: {campaign.status}</span>
          {campaign.scheduled_for && (
            <span>
              Scheduled: {format(new Date(campaign.scheduled_for), "PPP")}
            </span>
          )}
        </div>
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
          <DropdownMenuItem onClick={handleDelete}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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