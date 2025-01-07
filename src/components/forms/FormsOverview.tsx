import { Card } from "@/components/ui/card";
import { FormBuilder } from "./FormBuilder";
import { useState, useEffect } from "react";
import { ViewSubmissionsDialog } from "./view/ViewSubmissionsDialog";
import { EditFormDialog } from "./EditFormDialog";
import { useToast } from "@/hooks/use-toast";
import { CustomForm } from "./types";
import { FormsList } from "./FormsList";
import { useFormsData } from "@/hooks/forms/useFormsData";
import { FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

export const FormsOverview = () => {
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { forms, groups, isLoadingForms, isLoadingGroups, queryClient } = useFormsData();

  useEffect(() => {
    const channel = supabase
      .channel('custom_forms_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_forms'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['custom-forms'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

  const confirmDelete = async () => {
    if (!selectedForm) return;

    try {
      // First check if the form still exists
      const { data: existingForm, error: checkError } = await supabase
        .from('custom_forms')
        .select('id')
        .eq('id', selectedForm.id)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (!existingForm) {
        toast({
          title: "Error",
          description: "This form no longer exists.",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['custom-forms'] });
        return;
      }

      const { error } = await supabase
        .from('custom_forms')
        .delete()
        .eq('id', selectedForm.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form deleted successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ['custom-forms'] });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Error",
        description: "Failed to delete form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Forms</h2>
        <FormBuilder groupId={groups[0].id} />
      </div>

      <FormsList
        forms={forms}
        isLoading={isLoadingForms}
        onViewSubmissions={handleViewSubmissions}
        onEdit={handleEdit}
        onDelete={handleDelete}
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

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the form
                  and all its submissions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};
