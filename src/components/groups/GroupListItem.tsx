import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Pencil, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { ViewContactsDialog } from "./ViewContactsDialog";
import { EditGroupDialog } from "./EditGroupDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface GroupListItemProps {
  group: {
    id: string;
    name: string;
    contacts: { count: number }[] | null;
  };
}

export function GroupListItem({ group }: GroupListItemProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contactCount, setContactCount] = useState(
    Array.isArray(group.contacts) && group.contacts.length > 0
      ? group.contacts[0].count
      : 0
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Subscribe to contact changes for this group
  useEffect(() => {
    const channel = supabase
      .channel('contacts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `group_id=eq.${group.id}`
        },
        async () => {
          // Fetch updated contact count
          const { count } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
          
          setContactCount(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [group.id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('campaign_groups')
        .delete()
        .eq('id', group.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-groups'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{group.name}</h3>
          <p className="text-sm text-muted-foreground">
            {contactCount} contacts
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsViewOpen(true)}
        >
          <Users className="h-4 w-4 mr-2" />
          View Contacts
        </Button>
      </div>
      <ViewContactsDialog
        group={group}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />
      <EditGroupDialog
        group={group}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </Card>
  );
}