
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FormLoader } from "@/components/forms/view/FormLoader";
import { FormError } from "@/components/forms/view/FormError";
import { ViewFormContent } from "@/components/forms/view/ViewFormContent";
import { useFormData } from "@/hooks/forms/useFormData";
import { useTranslation } from "react-i18next";

export default function ViewForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const { t, i18n } = useTranslation("forms");
  const { form, loading, fetchForm } = useFormData();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      // Set session variable directly through SQL query
      const fetchData = async () => {
        await supabase.from('custom_forms').select('id').limit(1).then(() => {
          fetchForm(id);
        });
      };
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // Check for duplicate using a COUNT query
      const { count, error: checkError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .eq('group_id', form.group_id)
        .eq('phone_number', phoneNumber);

      console.log("Duplicate check result:", { count, checkError });

      if (checkError) {
        console.error('Error checking for duplicate:', checkError);
        throw checkError;
      }

      if (count && count > 0) {
        toast({
          title: t("submission.warning.title"),
          description: t("submission.warning.alreadyInGroup"),
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Create the contact if it doesn't exist
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

      // Then create the form submission
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: id,
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
          formId: id,
          language: i18n.language,
        },
      });

      if (welcomeError) {
        console.error('Error sending welcome message:', welcomeError);
        // Don't throw here, we still want to show success for the form submission
      }

      // Show success message
      toast({
        title: t("submission.success.title"),
        description: t("submission.success.description"),
      });

      // Set submitted state to true
      setSubmitted(true);

      // Reset form
      setFormData({});
      const formElements = document.querySelectorAll('input, textarea, select');
      formElements.forEach((element: any) => {
        if (element.type !== 'submit') {
          element.value = '';
        }
      });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FormLoader />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FormError />
      </div>
    );
  }

  if (submitted) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center py-12 px-4"
        style={{
          backgroundColor: form.background_color || '#000000',
          backgroundImage: form.background_image_url ? `url(${form.background_image_url})` : undefined,
          backgroundSize: form.background_image_style === 'repeat' ? 'auto' : form.background_image_style,
          backgroundRepeat: form.background_image_style === 'repeat' ? 'repeat' : 'no-repeat',
          backgroundPosition: 'center',
          fontFamily: form.font_family || 'Inter',
        }}
      >
        <Card className="w-full max-w-2xl mx-auto p-6 sm:p-8 text-center bg-black/80 backdrop-blur-sm border-gray-800/50">
          <h2 className="text-2xl font-bold mb-4" style={{ color: form.primary_color }}>
            {t("submission.success.title")}
          </h2>
          <p className="text-gray-300 mb-6">{t("submission.success.description")}</p>
          <button
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md"
            style={{
              backgroundColor: form.primary_color,
              color: '#ffffff',
            }}
          >
            {t("submission.success.submitAnother")}
          </button>
        </Card>
      </div>
    );
  }

  const backgroundStyle = {
    backgroundColor: form.background_color || '#000000',
    fontFamily: form.font_family || 'Inter',
  };

  if (form.background_image_url) {
    Object.assign(backgroundStyle, {
      backgroundImage: `url(${form.background_image_url})`,
      backgroundSize: form.background_image_style === 'repeat' ? 'auto' : form.background_image_style,
      backgroundRepeat: form.background_image_style === 'repeat' ? 'repeat' : 'no-repeat',
      backgroundPosition: 'center',
    });
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center py-12 px-4"
      style={backgroundStyle}
    >
      <Card 
        className="w-full max-w-2xl mx-auto p-6 sm:p-8 relative overflow-hidden bg-black/80 backdrop-blur-sm border-gray-800/50"
      >
        {form.background_image_url && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundColor: form.background_color,
              opacity: (form.background_opacity || 100) / 100,
            }}
          />
        )}
        <div className="relative z-10">
          <ViewFormContent
            form={form}
            formData={formData}
            onFieldChange={(fieldName, value) => {
              setFormData(prev => ({ ...prev, [fieldName]: value }));
            }}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </Card>
    </div>
  );
}
