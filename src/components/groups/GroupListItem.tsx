import { useState } from "react";
import { Edit, Trash2, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { EditGroupDialog } from "./EditGroupDialog";
import { ImportContactsDialog } from "./ImportContactsDialog";
import { ViewContactsDialog } from "./ViewContactsDialog";

interface GroupListItemProps {
  group: {
    id: string;
    name: string;
    contacts: { count: number }[];
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
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div>
        <h3 className="font-medium">{group.name}</h3>
        <p className="text-sm text-gray-500">
          {group.contacts[0]?.count || 0} contacts
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsViewContactsOpen(true)}
        >
          <Users className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsImportOpen(true)}
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}