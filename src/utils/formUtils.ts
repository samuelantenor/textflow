import { supabase } from "@/integrations/supabase/client";

export async function deleteFormAndSubmissions(formId: string) {
  // First, delete all submissions for this form
  const { error: submissionsError } = await supabase
    .from('form_submissions')
    .delete()
    .eq('form_id', formId);

  if (submissionsError) {
    throw new Error(`Failed to delete form submissions: ${submissionsError.message}`);
  }

  // Then, delete the form itself
  const { error: formError } = await supabase
    .from('custom_forms')
    .delete()
    .eq('id', formId);

  if (formError) {
    throw new Error(`Failed to delete form: ${formError.message}`);
  }
}