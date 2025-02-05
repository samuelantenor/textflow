
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
      // Set session variable directly through SQL query
      const fetchData = async () => {
        await supabase.from('_templates').select('*').limit(1).then(() => {
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
