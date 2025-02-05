import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { ViewContactsDialog } from "./ViewContactsDialog";
import { EditGroupDialog } from "./EditGroupDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['groups']);

  // Get the contact count from the array of counts
  const contactCount = Array.isArray(group.contacts) && group.contacts.length > 0
    ? group.contacts[0].count
    : 0;

  const handleDelete = async () => {
    if (!confirm(t('delete.confirm'))) {
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
        title: t('delete.success'),
        description: t('delete.success'),
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-groups'] });
    } catch (error) {
      toast({
        title: t('delete.error'),
        description: error instanceof Error ? error.message : t('delete.error'),
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
            {t('contacts.count', { count: contactCount })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsEditOpen(true)}
            title={t('actions.edit')}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            title={t('actions.delete')}
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
          {t('actions.view')}
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