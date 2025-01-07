import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MessageSquare } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
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

    toast({
      title: "Success",
      description: "Campaign deleted successfully",
    });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  const handleEdit = () => {
    toast({
      title: "Coming soon",
      description: "Edit functionality will be available soon",
    });
  };

  const handleViewMessages = () => {
    toast({
      title: "Coming soon",
      description: "Message view functionality will be available soon",
    });
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewMessages}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}