import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // First, delete associated message logs
      const { error: logsError } = await supabase
        .from('message_logs')
        .delete()
        .eq('campaign_id', campaign.id);

      if (logsError) throw logsError;

      // Then delete the campaign
      const { error: campaignError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id);

      if (campaignError) throw campaignError;

      toast({
        title: "Campaign deleted",
        description: "Campaign has been successfully deleted.",
      });

      // Invalidate campaigns query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border p-4 rounded-md">
      <h3 className="text-lg font-semibold">{campaign.name}</h3>
      <p>{campaign.message}</p>
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete Campaign"}
        </Button>
      </div>
    </div>
  );
}
