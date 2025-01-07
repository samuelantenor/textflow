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
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

const CampaignTable = () => {
  const { toast } = useToast();

  const { data: campaigns, refetch, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
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

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!campaigns?.length) {
    return (
      <Card className="p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
        <div>
          <h3 className="text-lg font-semibold">No Campaigns Yet</h3>
          <p className="text-muted-foreground">
            Create your first campaign to get started.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border bg-card">
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
            <TableRow key={campaign.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    campaign.status === "sent"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : campaign.status === "draft"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
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
    </Card>
  );
};

export default CampaignTable;