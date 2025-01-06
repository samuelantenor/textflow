import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Pencil } from "lucide-react";
import { useState } from "react";
import { ViewContactsDialog } from "./ViewContactsDialog";
import { EditGroupDialog } from "./EditGroupDialog";
import { FormBuilder } from "../forms/FormBuilder";

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

  // Safely get the contact count, defaulting to 0 if undefined
  const contactCount = group.contacts?.[0]?.count ?? 0;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{group.name}</h3>
          <p className="text-sm text-muted-foreground">
            {contactCount} contacts
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
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
        <FormBuilder groupId={group.id} />
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