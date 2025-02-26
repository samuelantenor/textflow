
import { Card } from "@/components/ui/card";
import { FormsCard } from "./FormsCard";
import { EmptyFormsState } from "./EmptyFormsState";
import { CustomForm } from "./types";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormsListProps {
  forms: CustomForm[] | undefined;
  isLoading: boolean;
  onShare: (form: CustomForm) => void;
  onViewSubmissions: (form: CustomForm) => void;
  onEdit: (form: CustomForm) => void;
  onDelete: (form: CustomForm) => void;
}

export const FormsList = ({
  forms,
  isLoading,
  onShare,
  onViewSubmissions,
  onEdit,
  onDelete
}: FormsListProps) => {
  const { t } = useTranslation(["forms"]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <p className="text-muted-foreground">{t("list.loading")}</p>
        </div>
      </Card>
    );
  }

  if (!forms) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t("errors.unauthorized")}
        </AlertDescription>
      </Alert>
    );
  }

  if (forms.length === 0) {
    return <EmptyFormsState />;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {forms.map((form) => (
        <FormsCard
          key={form.id}
          form={form}
          onShare={onShare}
          onViewSubmissions={onViewSubmissions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
