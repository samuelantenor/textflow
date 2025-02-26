import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Eye, Pencil, Trash2 } from "lucide-react";
import { CustomForm } from "./types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("forms");

  // Memoize handlers to prevent unnecessary re-renders
  const handleShare = () => onShare(form);
  const handleViewSubmissions = () => onViewSubmissions(form);
  const handleEdit = () => onEdit(form);
  const handleDelete = () => onDelete(form);

  return (
    <Card className="campaign-card p-6 relative group">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold truncate">{form.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {form.description || t("list.noDescription")}
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          {t("list.group")}: {form.campaign_groups?.name || t("list.noGroup")}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "flex items-center gap-2 transition-opacity",
              "hover:bg-secondary/80"
            )}
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            {t("list.buttons.share")}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "flex items-center gap-2 transition-opacity",
              "hover:bg-secondary/80"
            )}
            onClick={handleViewSubmissions}
          >
            <Eye className="h-4 w-4" />
            {t("list.buttons.view")}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "flex items-center gap-2 transition-opacity",
              "hover:bg-secondary/80"
            )}
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4" />
            {t("list.buttons.edit")}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2 transition-opacity"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            {t("list.buttons.delete")}
          </Button>
        </div>
      </div>
    </Card>
  );
};