import { Button } from "@/components/ui/button";
import { Edit, Trash2, Upload, Users, Plus } from "lucide-react";

interface GroupActionsProps {
  onView: () => void;
  onAdd: () => void;
  onImport: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const GroupActions = ({ onView, onAdd, onImport, onEdit, onDelete }: GroupActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={onView}
      >
        <Users className="h-4 w-4 mr-2" />
        View
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={onAdd}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={onImport}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </div>
  );
};