import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormLoader } from "@/components/forms/view/FormLoader";
import { FormError } from "@/components/forms/view/FormError";
import { FormFields } from "@/components/forms/view/FormFields";
import { useFormData } from "@/hooks/forms/useFormData";
import { Loader2 } from "lucide-react";

export default function ViewForm() {
  const { formId } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { form, isLoading, error } = useFormData(formId);

  if (isLoading) return <FormLoader />;
  if (error || !form) return <FormError message={error?.message} />;

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Insert form submission with the predefined group_id from the form
      const { error: submissionError } = await supabase
        .from("form_submissions")
        .insert({
          form_id: formId,
          data: formData,
        });

      if (submissionError) throw submissionError;

      toast({
        title: "Form submitted",
        description: "Thank you for your submission!",
      });

      // Reset form
      setFormData({});
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground mt-2">{form.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <FormFields
              fields={form.fields}
              formData={formData}
              onFieldChange={handleFieldChange}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}