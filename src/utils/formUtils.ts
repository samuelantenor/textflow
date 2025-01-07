import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export async function deleteFormAndSubmissions(formId: string) {
  // First, check if there are any submissions
  const { data: submissions, error: checkError } = await supabase
    .from('form_submissions')
    .select('id')
    .eq('form_id', formId);

  if (checkError) {
    console.error('Error checking form submissions:', checkError);
    throw new Error('Failed to check form submissions');
  }

  // If there are submissions, delete them first
  if (submissions && submissions.length > 0) {
    const { error: submissionsError } = await supabase
      .from('form_submissions')
      .delete()
      .eq('form_id', formId);

    if (submissionsError) {
      console.error('Error deleting form submissions:', submissionsError);
      throw new Error('Failed to delete form submissions');
    }
  }

  // Then, delete the form itself
  const { error: formError } = await supabase
    .from('custom_forms')
    .delete()
    .eq('id', formId);

  if (formError) {
    console.error('Error deleting form:', formError);
    throw new Error('Failed to delete form');
  }
}