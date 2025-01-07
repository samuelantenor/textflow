import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { ShareFormDialog } from "./ShareFormDialog";
import { ViewSubmissionsDialog } from "./view/ViewSubmissionsDialog";
import { EditFormDialog } from "./EditFormDialog";
import { DeleteFormDialog } from "./DeleteFormDialog";
import { FormsHeader } from "./FormsHeader";
import { FormsList } from "./FormsList";
import { useFormsData } from "@/hooks/forms/useFormsData";
import { CustomForm } from "./types";

export const FormsOverview = () => {
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { forms, groups, isLoading, isLoadingGroups } = useFormsData();

  const handleShare = (form: CustomForm) => {
    setSelectedForm(form);
    setShareDialogOpen(true);
  };

  const handleViewSubmissions = (form: CustomForm) => {
    setSelectedForm(form);
    setSubmissionsDialogOpen(true);
  };

  const handleEdit = (form: CustomForm) => {
    setSelectedForm(form);
    setEditDialogOpen(true);
  };

  const handleDelete = (form: CustomForm) => {
    setSelectedForm(form);
    setDeleteDialogOpen(true);
  };

  if (!groups?.length) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Forms</h2>
          <Card className="p-12 text-center space-y-4 mt-4">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Create a Contact Group First</h3>
              <p className="text-muted-foreground">
                You need to create a contact group before you can create a form.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FormsHeader groupId={groups[0].id} />

      <FormsList
        forms={forms}
        isLoading={isLoading}
        onShare={handleShare}
        onViewSubmissions={handleViewSubmissions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ShareFormDialog
        form={selectedForm}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />

      {selectedForm && (
        <>
          <ViewSubmissionsDialog
            formId={selectedForm.id}
            open={submissionsDialogOpen}
            onOpenChange={setSubmissionsDialogOpen}
          />

          <EditFormDialog
            form={selectedForm}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />

          <DeleteFormDialog
            form={selectedForm}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </div>
  );
};