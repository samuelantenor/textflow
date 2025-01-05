import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GroupListItem } from "./GroupListItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { useState } from "react";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaign Groups</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>
      
      {!groups?.length ? (
        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
          No groups found. Create your first group to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <GroupListItem key={group.id} group={group} />
          ))}
        </div>
      )}

      <CreateGroupDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}