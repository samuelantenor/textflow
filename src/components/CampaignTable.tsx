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

const CampaignTable = () => {
  const { toast } = useToast();

  const { data: campaigns, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_groups (
            name
          ),
          phone_numbers (
            phone_number,
            friendly_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

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
    refetch();
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>From Number</TableHead>
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
                {campaign.campaign_groups?.name || "No group assigned"}
              </TableCell>
              <TableCell>
                {campaign.phone_numbers?.friendly_name || campaign.phone_numbers?.phone_number || "No number assigned"}
              </TableCell>
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
                    onClick={() => {
                      // TODO: Implement edit functionality
                      toast({
                        title: "Coming soon",
                        description: "Edit functionality will be available soon",
                      });
                    }}
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
    </div>
  );
};

export default CampaignTable;