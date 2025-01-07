import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FormLoader } from "@/components/forms/view/FormLoader";
import { FormError } from "@/components/forms/view/FormError";
import { FormFields } from "@/components/forms/view/FormFields";
import { FormContainer } from "@/components/forms/view/FormContainer";
import { FormHeader } from "@/components/forms/view/FormHeader";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/types/form";
import { LandingPage } from "@/integrations/supabase/types/landing-pages";

interface FormResponse {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  is_active: boolean;
  landing_page: LandingPage;
}

export default function ViewForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { data: form, isLoading: isLoadingForm } = useQuery({
    queryKey: ['form', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms')
        .select(`
          id,
          title,
          description,
          fields,
          is_active,
          landing_pages (
            id,
            user_id,
            title,
            description,
            welcome_message,
            template_id,
            primary_color,
            font_family,
            logo_url,
            published,
            background_color
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Form not found');

      // Parse fields as FormField[]
      const parsedFields = data.fields as FormField[];
      
      // Get the first landing page (assuming one-to-one relationship)
      const landingPage = data.landing_pages[0];
      if (!landingPage) throw new Error('Landing page not found');

      const formResponse: FormResponse = {
        id: data.id,
        title: data.title,
        description: data.description,
        fields: parsedFields,
        is_active: data.is_active,
        landing_page: landingPage
      };

      return formResponse;
    },
  });

  if (isLoadingForm) {
    return <FormLoader />;
  }

  if (!form || !form.is_active) {
    return <FormError message="This form is no longer active or does not exist." />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: id,
          data: formData,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your form has been submitted successfully.",
      });

      // Reset form
      setFormData({});
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <FormContainer landingPage={form.landing_page}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormHeader 
          title={form.title} 
          description={form.description} 
        />
        <FormFields
          fields={form.fields}
          formData={formData}
          onFieldChange={handleFieldChange}
          primaryColor={form.landing_page.primary_color}
        />
        <Button 
          type="submit"
          className="w-full"
          style={{ backgroundColor: form.landing_page.primary_color }}
        >
          Submit
        </Button>
      </form>
    </FormContainer>
  );
}