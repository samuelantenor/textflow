import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormLoader } from "@/components/forms/view/FormLoader";
import { FormError } from "@/components/forms/view/FormError";
import { FormFields } from "@/components/forms/view/FormFields";
import { supabase } from "@/integrations/supabase/client";

export default function ViewForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_forms')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Form not found');

        setForm(data);
      } catch (error) {
        console.error('Error fetching form:', error);
        toast({
          title: "Error",
          description: "Failed to load form",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id, toast]);

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

    const phoneField = form.fields.find((field: any) => 
      field.label.toLowerCase().includes('phone') || 
      field.label.toLowerCase().includes('mobile')
    );

    const phoneNumber = phoneField ? formData[phoneField.label] : null;
    const nameField = form.fields.find((field: any) => 
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
      // Create the contact
      const { error: contactError } = await supabase
        .from('contacts')
        .insert({
          group_id: form.group_id,
          name: name,
          phone_number: phoneNumber,
        });

      if (contactError) throw contactError;

      // Create the form submission
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

      // Reset form
      setFormData({});
      
      // Reset form fields
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
        description: "Failed to submit form",
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

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{
        backgroundColor: form.background_color || '#FFFFFF',
        fontFamily: form.font_family || 'Inter',
      }}
    >
      <Card 
        className="max-w-2xl mx-auto p-6"
        style={{
          backgroundColor: form.background_color || '#FFFFFF',
        }}
      >
        {form.logo_url && (
          <div className="flex justify-center mb-6">
            <img 
              src={form.logo_url} 
              alt="Form logo" 
              className="max-h-20 object-contain"
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h1 
              className="text-2xl font-bold mb-2"
              style={{ color: form.primary_color }}
            >
              {form.title}
            </h1>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
          </div>

          <FormFields
            fields={form.fields}
            formData={formData}
            onFieldChange={(fieldName, value) => {
              setFormData(prev => ({ ...prev, [fieldName]: value }));
            }}
            customization={{
              primaryColor: form.primary_color,
            }}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitting}
            style={{
              backgroundColor: form.primary_color,
              borderColor: form.primary_color,
            }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Card>
    </div>
  );
}