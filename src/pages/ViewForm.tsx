import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FormData, FormField } from "@/types/form";
import { FormFieldRenderer } from "@/components/forms/FormFieldRenderer";

export default function ViewForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms')
        .select(`
          id,
          title,
          description,
          fields
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Parse and validate the fields array
      const parsedFields = data.fields as FormField[];
      if (!Array.isArray(parsedFields)) {
        throw new Error('Invalid form fields format');
      }

      return {
        ...data,
        fields: parsedFields
      } as FormData;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert([
          {
            form_id: id,
            data: formData,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your response has been submitted.",
      });

      // Reset form
      setFormData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold mb-2">Form Not Found</h1>
          <p className="text-muted-foreground">
            The form you're looking for doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <Card className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
          </div>

          <div className="space-y-6">
            {form.fields.map((field: FormField, index: number) => (
              <div key={index} className="space-y-2">
                {field.type !== 'checkbox' && (
                  <Label htmlFor={`field-${index}`}>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                )}
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
                <FormFieldRenderer
                  field={field}
                  index={index}
                  value={formData[field.label]}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, [field.label]: value }));
                  }}
                />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Card>
    </div>
  );
}