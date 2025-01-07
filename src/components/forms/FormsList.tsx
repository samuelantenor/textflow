import { Card } from "@/components/ui/card";
import { CustomForm } from "./types";
import { FormsCard } from "./FormsCard";
import { EmptyFormsState } from "./EmptyFormsState";

interface FormsListProps {
  forms: CustomForm[] | null;
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
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!forms?.length) {
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