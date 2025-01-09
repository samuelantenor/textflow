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

export const FormsOverview = () => {
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { forms, groups, isLoadingForms, queryClient } = useFormsData();

  useEffect(() => {
    const channel = supabase
      .channel("custom_forms_changes")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "custom_forms",
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleEdit = async (form: CustomForm) => {
    try {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("id", form.id)
        .single();

      if (error) throw error;

      setSelectedForm(form);
      setEditDialogOpen(true);
    } catch (error) {
      console.error("Error fetching form:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load form data. Please try again.",
        variant: "destructive" 
      });
    }
  };

  const handleShare = (form: CustomForm) => {
    setSelectedForm(form);
    setShareDialogOpen(true);
  };

  const handleViewSubmissions = (form: CustomForm) => {
    setSelectedForm(form);
    setSubmissionsDialogOpen(true);
  };

  const handleDelete = async (form: CustomForm) => {
    try {
      const { error } = await supabase
        .from("custom_forms")
        .delete()
        .eq("id", form.id);

      if (error) throw error;

      toast({ title: "Success", description: "Form deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["custom-forms"] });
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({ 
        title: "Error", 
        description: "Failed to delete form.", 
        variant: "destructive" 
      });
    }
  };

  if (!groups?.length) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Forms</h2>
        <Card className="p-12 text-center space-y-4 mt-4">
          <p className="text-muted-foreground">
            You need to create a contact group before you can create a form.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Forms</h2>
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
      {selectedForm && (
        <>
          <ShareFormDialog 
            form={selectedForm} 
            open={shareDialogOpen} 
            onOpenChange={setShareDialogOpen} 
          />
          <EditFormDialog 
            form={selectedForm} 
            open={editDialogOpen} 
            onOpenChange={setEditDialogOpen} 
          />
          <ViewSubmissionsDialog
            formId={selectedForm.id}
            open={submissionsDialogOpen}
            onOpenChange={setSubmissionsDialogOpen}
          />
        </>
      )}
    </div>
  );
};