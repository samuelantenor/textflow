import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Share2, Eye, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onDelete,
}: FormsCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{form.title}</h3>
          <p className="text-sm text-muted-foreground">{form.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onShare(form)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewSubmissions(form)}>
              <Eye className="mr-2 h-4 w-4" />
              View Submissions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(form)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(form)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="text-sm text-muted-foreground">
        Group: {form.campaign_groups?.name || "No group"}
      </div>
    </Card>
  );
};