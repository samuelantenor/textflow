
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormResponse } from "@/types/form";

export function useFormSubmission(form: FormResponse | null) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation("forms");

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!form?.group_id) {
      toast({
        title: t("errors.title"),
        description: t("errors.formConfiguration"),
        variant: "destructive",
      });
      return;
    }

    const phoneField = form.fields.find(field => 
      field.label.toLowerCase().includes('phone') || 
      field.label.toLowerCase().includes('mobile')
    );

    const phoneNumber = phoneField ? formData[phoneField.label] : null;
    const nameField = form.fields.find(field => 
      field.label.toLowerCase().includes('name')
    );
    const name = nameField ? formData[nameField.label] : null;

    if (!phoneNumber) {
      toast({
        title: t("errors.title"),
        description: t("errors.phoneRequired"),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Check for duplicate phone number in the group
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('id')
        .eq('group_id', form.group_id)
        .eq('phone_number', phoneNumber)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingContact) {
        toast({
          title: t("errors.title"),
          description: t("errors.duplicatePhone"),
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Create the contact
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .insert({
          group_id: form.group_id,
          name: name,
          phone_number: phoneNumber,
        })
        .select('id')
        .single();

      if (contactError) {
        console.error('Error creating contact:', contactError);
        throw contactError;
      }

      // Create the form submission
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: form.id,
          data: formData,
        });

      if (submissionError) {
        console.error('Error creating submission:', submissionError);
        throw submissionError;
      }

      // Send welcome message
      const { error: welcomeError } = await supabase.functions.invoke('send-welcome-message', {
        body: { 
          phoneNumber,
          formId: form.id,
          language: i18n.language,
        },
      });

      if (welcomeError) {
        console.error('Error sending welcome message:', welcomeError);
      }

      // Show success message
      toast({
        title: t("submission.success.title"),
        description: t("submission.success.description"),
      });

      setSubmitted(true);

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t("errors.title"),
        description: t("errors.submissionFailed"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    submitted,
    setSubmitted,
    handleSubmit,
  };
}
