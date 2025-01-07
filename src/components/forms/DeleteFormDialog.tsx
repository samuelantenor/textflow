import { CustomForm } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
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

interface DeleteFormDialogProps {
  form: CustomForm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteFormDialog = ({ form, open, onOpenChange }: DeleteFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!form) return;

    try {
      // First delete all form submissions
      const { error: submissionsError } = await supabase
        .from('form_submissions')
        .delete()
        .eq('form_id', form.id);

      if (submissionsError) throw submissionsError;

      // Then delete the form
      const { error } = await supabase
        .from('custom_forms')
        .delete()
        .eq('id', form.id);

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
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};