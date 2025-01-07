import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormFields } from "@/components/forms/view/FormFields";
import { FormLoader } from "@/components/forms/view/FormLoader";
import { FormError } from "@/components/forms/view/FormError";

export default function ViewForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        console.log('Fetching form with ID:', id);
        const { data, error } = await supabase
          .from('custom_forms')
          .select('*, campaign_groups(name)')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching form:', error);
          throw error;
        }
        
        if (!data) {
          setError('Form not found');
          return;
        }

        if (!data.is_active) {
          setError('This form is no longer active');
          return;
        }

        console.log('Form data:', data);
        setForm(data);
      } catch (error) {
        console.error('Error fetching form:', error);
        setError('Failed to load form');
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
    
    try {
      setSubmitting(true);
      console.log('Submitting form data:', formData);

      // Create the form submission
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: id,
          data: formData,
        });

      if (submissionError) throw submissionError;

      // Create contact if phone field exists
      const phoneField = form.fields.find((field: any) => 
        field.type === 'phone' || field.label.toLowerCase().includes('phone')
      );

      if (phoneField && formData[phoneField.label]) {
        const { error: contactError } = await supabase
          .from('contacts')
          .insert({
            group_id: form.group_id,
            phone_number: formData[phoneField.label],
            name: formData['name'] || null,
          });

        if (contactError) throw contactError;
      }

      toast({
        title: "Success",
        description: "Form submitted successfully",
      });

      // Reset form
      setFormData({});
      
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

  if (error || !form) {
    return <FormError message={error || 'Form not found'} />;
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