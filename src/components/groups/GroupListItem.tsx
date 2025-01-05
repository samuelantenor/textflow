import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { EditGroupDialog } from "./EditGroupDialog";
import { ImportContactsDialog } from "./ImportContactsDialog";
import { ViewContactsDialog } from "./ViewContactsDialog";
import { AddContactDialog } from "./AddContactDialog";
import { Card } from "@/components/ui/card";
import { GroupHeader } from "./GroupHeader";
import { GroupActions } from "./GroupActions";

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
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
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
      <GroupHeader
        name={group.name}
        contactCount={group.contacts[0]?.count || 0}
        createdAt={group.created_at}
      />

      <GroupActions
        onView={() => setIsViewContactsOpen(true)}
        onAdd={() => setIsAddContactOpen(true)}
        onImport={() => setIsImportOpen(true)}
        onEdit={() => setIsEditOpen(true)}
        onDelete={handleDelete}
      />

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
      <AddContactDialog
        groupId={group.id}
        open={isAddContactOpen}
        onOpenChange={setIsAddContactOpen}
      />
    </Card>
  );
}