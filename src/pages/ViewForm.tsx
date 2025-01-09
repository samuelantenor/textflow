import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FormLoader } from "@/components/forms/view/FormLoader";
import { FormError } from "@/components/forms/view/FormError";
import { ViewFormContent } from "@/components/forms/view/ViewFormContent";
import { useFormData } from "@/hooks/forms/useFormData";

export default function ViewForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const { form, loading, fetchForm } = useFormData();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (id) {
      fetchForm(id);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form?.group_id) {
      toast({
        title: "Error",
        description: "This form is not properly configured.",
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
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create the contact first
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

      toast({
        title: "Success",
        description: "Form submitted successfully",
      });

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
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FormLoader />;
  }

  if (!form) {
    return <FormError />;
  }

  const websiteBackgroundStyle: React.CSSProperties = {
    minHeight: '100vh',
    padding: '12px 16px',
  };

  // Apply website background styling based on the selected style
  if (form.website_background_style === 'gradient' && form.website_background_gradient) {
    websiteBackgroundStyle.backgroundImage = form.website_background_gradient;
  } else if (form.website_background_style === 'image' && form.website_background_image_url) {
    websiteBackgroundStyle.backgroundImage = `url(${form.website_background_image_url})`;
    websiteBackgroundStyle.backgroundSize = 'cover';
    websiteBackgroundStyle.backgroundPosition = 'center';
  } else {
    websiteBackgroundStyle.backgroundColor = form.website_background_color || '#FFFFFF';
  }

  const formBackgroundStyle: React.CSSProperties = {
    backgroundColor: form.background_color || '#FFFFFF',
    fontFamily: form.font_family || 'Inter',
    position: 'relative',
  };

  if (form.background_image_url) {
    Object.assign(formBackgroundStyle, {
      backgroundImage: `url(${form.background_image_url})`,
      backgroundSize: form.background_image_style === 'repeat' ? 'auto' : form.background_image_style,
      backgroundRepeat: form.background_image_style === 'repeat' ? 'repeat' : 'no-repeat',
      backgroundPosition: 'center',
    });
  }

  return (
    <div style={websiteBackgroundStyle}>
      <Card 
        className="max-w-2xl mx-auto p-6 relative overflow-hidden"
        style={formBackgroundStyle}
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
        <ViewFormContent
          form={form}
          formData={formData}
          onFieldChange={(fieldName, value) => {
            setFormData(prev => ({ ...prev, [fieldName]: value }));
          }}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </Card>
    </div>
  );
}