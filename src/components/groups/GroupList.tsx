import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GroupListItem } from "./GroupListItem";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export function GroupList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: groups, isLoading } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_groups')
        .select('*, contacts(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contact Groups</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>
      
      {!groups?.length ? (
        <Card className="p-12 text-center space-y-4">
          <Users className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No Contact Groups</h3>
            <p className="text-muted-foreground">
              Create your first group to start organizing your contacts.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Group
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupListItem key={group.id} group={group} />
          ))}
        </div>
      )}

      <CreateGroupDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}