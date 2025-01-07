import { Card } from "@/components/ui/card";
import { FormBuilder } from "./FormBuilder";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { ShareFormDialog } from "./ShareFormDialog";
import { ViewSubmissionsDialog } from "./view/ViewSubmissionsDialog";
import { EditFormDialog } from "./EditFormDialog";
import { useToast } from "@/hooks/use-toast";
import { FormsCard } from "./FormsCard";
import { EmptyFormsState } from "./EmptyFormsState";
import { CustomForm } from "./types";
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

export const FormsOverview = () => {
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_groups')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: forms, isLoading } = useQuery({
    queryKey: ['custom-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms')
        .select(`
          id,
          title,
          description,
          fields,
          group_id,
          background_color,
          font_family,
          logo_url,
          primary_color,
          campaign_groups (
            name
          )
        `);
      
      if (error) throw error;
      
      return (data || []).map(form => ({
        ...form,
        fields: Array.isArray(form.fields) ? form.fields : []
      })) as CustomForm[];
    },
  });

  // Subscribe to real-time changes
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
          // Invalidate and refetch forms when changes occur
          queryClient.invalidateQueries({ queryKey: ['custom-forms'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

  const confirmDelete = async () => {
    if (!selectedForm) return;

    try {
      // First delete all form submissions
      const { error: submissionsError } = await supabase
        .from('form_submissions')
        .delete()
        .eq('form_id', selectedForm.id);

      if (submissionsError) throw submissionsError;

      // Then delete the form
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ) : forms?.length ? (
          forms.map((form) => (
            <FormsCard
              key={form.id}
              form={form}
              onShare={handleShare}
              onViewSubmissions={handleViewSubmissions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <EmptyFormsState />
        )}
      </div>

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