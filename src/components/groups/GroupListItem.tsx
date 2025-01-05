import { useState } from "react";
import { Edit, Trash2, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { EditGroupDialog } from "./EditGroupDialog";
import { ImportContactsDialog } from "./ImportContactsDialog";
import { ViewContactsDialog } from "./ViewContactsDialog";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface GroupListItemProps {
  group: {
    id: string;
    name: string;
    contacts: { count: number }[];
    created_at: string;
  };
}

export function GroupListItem({ group }: GroupListItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isViewContactsOpen, setIsViewContactsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const { error } = await supabase
      .from('campaign_groups')
      .delete()
      .eq('id', group.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Group deleted successfully",
    });
    queryClient.invalidateQueries({ queryKey: ['campaign-groups'] });
  };

  return (
    <Card className="p-4 space-y-3 hover:shadow-lg transition-shadow">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg truncate" title={group.name}>
          {group.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {group.contacts[0]?.count || 0} contacts
        </p>
        <p className="text-xs text-muted-foreground">
          Created {format(new Date(group.created_at), "MMM d, yyyy")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setIsViewContactsOpen(true)}
        >
          <Users className="h-4 w-4 mr-2" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setIsImportOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setIsEditOpen(true)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <EditGroupDialog
        group={group}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      <ImportContactsDialog
        groupId={group.id}
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
      />
      <ViewContactsDialog
        groupId={group.id}
        open={isViewContactsOpen}
        onOpenChange={setIsViewContactsOpen}
      />
    </Card>
  );
}