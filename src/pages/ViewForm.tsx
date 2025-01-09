import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      // Check if the phone number already exists in the group
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
          title: "Already Subscribed",
          description: "This phone number is already registered in this group.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .insert({
          group_id: form.group_id,
          name: name,
          phone_number: phoneNumber,
        })
        .select()
        .single();

      if (contactError) throw contactError;

      const { error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: id,
          data: formData,
        });

      if (submissionError) throw submissionError;

      toast({
        title: "Success",
        description: "Form submitted successfully",
      });

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

  const backgroundStyle = {
    backgroundColor: form.background_color || '#FFFFFF',
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
      className="min-h-screen py-12 px-4"
      style={backgroundStyle}
    >
      <Card 
        className="max-w-2xl mx-auto p-6 relative overflow-hidden"
        style={{
          backgroundColor: form.background_color || '#FFFFFF',
        }}
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