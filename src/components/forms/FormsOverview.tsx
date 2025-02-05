import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FormBuilder } from "./FormBuilder";
import { ShareFormDialog } from "./ShareFormDialog";
import { ViewSubmissionsDialog } from "./view/ViewSubmissionsDialog";
import { EditFormDialog } from "./EditFormDialog";
import { useToast } from "@/hooks/use-toast";
import { CustomForm } from "./types";
import { FormsList } from "./FormsList";
import { useFormsData } from "@/hooks/forms/useFormsData";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export const FormsOverview = () => {
  const { t } = useTranslation("forms");
  const [selectedShareForm, setSelectedShareForm] = useState<CustomForm | null>(null);
  const [selectedEditForm, setSelectedEditForm] = useState<CustomForm | null>(null);
  const [selectedSubmissionForm, setSelectedSubmissionForm] = useState<CustomForm | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { forms, groups, isLoadingForms, queryClient } = useFormsData();

  useEffect(() => {
    console.log('Setting up realtime subscription');
    const channel = supabase
      .channel("custom_forms_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "custom_forms",
      }, () => {
        console.log('Received form change, invalidating query');
        queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
      })
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      channel.unsubscribe();
    };
  }, [queryClient]);

  const handleEdit = async (form: CustomForm) => {
    console.log('Opening edit dialog for form:', form.id);
    try {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("id", form.id)
        .single();

      if (error) throw error;

      // Transform the data to match CustomForm type
      const transformedData: CustomForm = {
        ...data,
        fields: Array.isArray(data.fields) ? data.fields : [],
        campaign_groups: form.campaign_groups || null,
      };

      setSelectedEditForm(transformedData);
      setEditDialogOpen(true);
    } catch (error) {
      toast({ 
        title: t("edit.error"), 
        description: t("edit.error"), 
        variant: "destructive" 
      });
    }
  };

  const handleShare = (form: CustomForm) => {
    console.log('Opening share dialog for form:', form.id);
    setSelectedShareForm(form);
    setShareDialogOpen(true);
  };

  const handleViewSubmissions = (form: CustomForm) => {
    console.log('Opening submissions dialog for form:', form.id);
    setSelectedSubmissionForm(form);
    setSubmissionsDialogOpen(true);
  };

  const handleDelete = async (form: CustomForm) => {
    try {
      const { error } = await supabase
        .from("custom_forms")
        .delete()
        .eq("id", form.id);

      if (error) throw error;

      toast({ 
        title: t("list.buttons.delete"), 
        description: t("list.success"), 
        variant: "default" 
      });
      queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
    } catch (error) {
      toast({ 
        title: t("list.buttons.delete"), 
        description: t("list.error"), 
        variant: "destructive" 
      });
    }
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
    setSelectedShareForm(null);
  };

  const handleCloseSubmissionsDialog = () => {
    setSubmissionsDialogOpen(false);
    setSelectedSubmissionForm(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedEditForm(null);
  };

  if (!groups?.length) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">{t("overview.title")}</h2>
        <Card className="p-12 text-center space-y-4 mt-4">
          <p className="text-muted-foreground">
            {t("overview.noGroups.description")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("overview.title")}</h2>
        <FormBuilder groupId={groups[0].id} />
      </div>
      <FormsList
        forms={forms}
        isLoading={isLoadingForms}
        onEdit={handleEdit}
        onShare={handleShare}
        onDelete={handleDelete}
        onViewSubmissions={handleViewSubmissions}
      />
      <ShareFormDialog
        form={selectedShareForm}
        open={shareDialogOpen}
        onOpenChange={handleCloseShareDialog}
      />
      {selectedEditForm && (
        <EditFormDialog 
          form={selectedEditForm} 
          open={editDialogOpen} 
          onOpenChange={handleCloseEditDialog}
        />
      )}
      <ViewSubmissionsDialog
        formId={selectedSubmissionForm?.id}
        open={submissionsDialogOpen}
        onOpenChange={handleCloseSubmissionsDialog}
      />
    </div>
  );
};