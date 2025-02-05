
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FormLoader } from "@/components/forms/view/FormLoader";
import { FormError } from "@/components/forms/view/FormError";
import { ViewFormContent } from "@/components/forms/view/ViewFormContent";
import { FormContainer } from "@/components/forms/view/FormContainer";
import { SubmissionSuccess } from "@/components/forms/view/SubmissionSuccess";
import { useFormData } from "@/hooks/forms/useFormData";
import { useFormSubmission } from "@/hooks/forms/useFormSubmission";

export default function ViewForm() {
  const { id } = useParams();
  const { form, loading, fetchForm } = useFormData();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { submitting, submitted, setSubmitted, handleSubmit } = useFormSubmission(form);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        await supabase.from('custom_forms').select('id').limit(1).then(() => {
          fetchForm(id);
        });
      };
      fetchData();
    }
  }, [id]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(formData);
    setFormData({});
    const formElements = document.querySelectorAll('input, textarea, select');
    formElements.forEach((element: any) => {
      if (element.type !== 'submit') {
        element.value = '';
      }
    });
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
    return <SubmissionSuccess form={form} onSubmitAnother={() => setSubmitted(false)} />;
  }

  const backgroundStyle = {
    backgroundColor: form.background_color || '#000000',
    fontFamily: form.font_family || 'Inter',
    ...(form.background_image_url && {
      backgroundImage: `url(${form.background_image_url})`,
      backgroundSize: form.background_image_style === 'repeat' ? 'auto' : form.background_image_style,
      backgroundRepeat: form.background_image_style === 'repeat' ? 'repeat' : 'no-repeat',
      backgroundPosition: 'center',
    }),
  };

  return (
    <FormContainer backgroundStyle={backgroundStyle}>
      <ViewFormContent
        form={form}
        formData={formData}
        onFieldChange={(fieldName, value) => {
          setFormData(prev => ({ ...prev, [fieldName]: value }));
        }}
        onSubmit={handleSubmitForm}
        submitting={submitting}
      />
    </FormContainer>
  );
}
