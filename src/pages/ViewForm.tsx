import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormLoader } from "@/components/forms/view/FormLoader";
import { FormError } from "@/components/forms/view/FormError";
import { FormFields } from "@/components/forms/view/FormFields";
import { useFormData } from "@/hooks/forms/useFormData";

interface FormStyle {
  backgroundColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export default function ViewForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const { form, loading, fetchForm } = useFormData();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formStyle, setFormStyle] = useState<FormStyle>({
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    primaryColor: '#ea384c'
  });

  useEffect(() => {
    if (id) {
      fetchForm(id);
    }
  }, [id]);

  // Load custom styles from landing_pages table
  useEffect(() => {
    const loadFormStyle = async () => {
      if (!form?.user_id) return;

      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('user_id', form.user_id)
        .single();

      if (error) {
        console.error('Error loading form style:', error);
        return;
      }

      if (data) {
        setFormStyle({
          backgroundColor: data.background_color || '#ffffff',
          fontFamily: data.font_family || 'Inter',
          logoUrl: data.logo_url,
          primaryColor: data.primary_color || '#ea384c'
        });
      }
    };

    loadFormStyle();
  }, [form?.user_id]);

  // Load custom font
  useEffect(() => {
    if (formStyle.fontFamily === 'Inter') return; // Default font, no need to load

    const loadFont = async () => {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${formStyle.fontFamily}:wght@400;500;600;700&display=swap`;
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    };

    loadFont();
  }, [formStyle.fontFamily]);

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
      const { error: contactError } = await supabase
        .from('contacts')
        .insert({
          group_id: form.group_id,
          name: name,
          phone_number: phoneNumber,
        });

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
        backgroundColor: formStyle.backgroundColor,
        fontFamily: formStyle.fontFamily
      }}
    >
      <Card className="max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-sm">
        {formStyle.logoUrl && (
          <div className="flex justify-center mb-6">
            <img 
              src={formStyle.logoUrl} 
              alt="Form Logo" 
              className="max-h-16 w-auto"
            />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h1 
              className="text-2xl font-bold mb-2"
              style={{ color: formStyle.primaryColor }}
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
            primaryColor={formStyle.primaryColor}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitting}
            style={{
              backgroundColor: formStyle.primaryColor,
              borderColor: formStyle.primaryColor
            }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Card>
    </div>
  );
}