import { Card } from "@/components/ui/card";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomForm } from "./types";

interface FormsCardProps {
  form: CustomForm;
  onShare: (form: CustomForm) => void;
  onViewSubmissions: (form: CustomForm) => void;
  onEdit: (form: CustomForm) => void;
  onDelete: (form: CustomForm) => void;
}

export const FormsCard = ({ 
  form, 
  onShare, 
  onViewSubmissions, 
  onEdit, 
  onDelete 
}: FormsCardProps) => {
  return (
    <Card key={form.id} className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">{form.title}</h3>
        {form.description && (
          <p className="text-sm text-muted-foreground">{form.description}</p>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        Group: {form.campaign_groups?.name || "No group selected"}
      </div>
      <div className="text-sm text-muted-foreground">
        Fields: {form.fields.length}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewSubmissions(form)}
        >
          View Submissions
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onShare(form)}
        >
          Share Form
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(form)}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(form)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </Card>
  );
};