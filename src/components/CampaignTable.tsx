
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { EditCampaignDialog } from "./campaign/EditCampaignDialog";
import { Campaign } from "@/types/campaign";
import { useTranslation } from "react-i18next";

const CampaignTable = () => {
  const { toast } = useToast();
  const { t } = useTranslation("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: campaigns, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('campaigns')
      .update({ 
        deleted_at: new Date().toISOString(),
        status: 'deleted'
      })
      .eq('id', id);

    if (error) {
      toast({
        title: t("errors.delete"),
        description: t("errors.campaignDeleteFailed"),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("success.deleted.title"),
      description: t("success.deleted.description"),
    });
    refetch();
  };

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditDialogOpen(true);
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled For</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns?.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                {campaign.scheduled_for
                  ? new Date(campaign.scheduled_for).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
                {new Date(campaign.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(campaign)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedCampaign && (
        <EditCampaignDialog
          campaign={selectedCampaign}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
};

export default CampaignTable;
