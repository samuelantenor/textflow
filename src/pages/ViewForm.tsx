import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormData } from "@/types/form";

interface FormResponse {
  id: string;
  title: string;
  description: string | null;
  fields: unknown;
  user: {
    id: string;
  };
}

export default function ViewForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data: formResponse, error: formError } = await supabase
          .from('custom_forms')
          .select('*, user:user_id(id)')
          .eq('id', id)
          .single();

        if (formError) throw formError;
        if (!formResponse) throw new Error('Form not found');

        // Type guard to validate fields structure
        const validateFields = (fields: unknown): fields is FormField[] => {
          if (!Array.isArray(fields)) return false;
          return fields.every(field => 
            typeof field === 'object' && 
            field !== null && 
            'type' in field && 
            'label' in field
          );
        };

        const response = formResponse as FormResponse;
        if (!validateFields(response.fields)) {
          throw new Error('Invalid form fields format');
        }

        setForm({
          id: response.id,
          title: response.title,
          description: response.description,
          fields: response.fields
        });

        // Fetch groups for this form's user
        const { data: groupsData, error: groupsError } = await supabase
          .from('campaign_groups')
          .select('*')
          .eq('user_id', response.user.id);

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);
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

    fetchForm();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) {
      toast({
        title: "Error",
        description: "Please select a group",
        variant: "destructive",
      });
      return;
    }

    try {
      // First submit the form data
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: id,
          data: formData,
        });

      if (submissionError) throw submissionError;

      // Then create a contact in the selected group
      const { error: contactError } = await supabase
        .from('contacts')
        .insert({
          group_id: selectedGroup,
          name: formData.name || null,
          phone_number: formData.phone_number,
        });

      if (contactError) throw contactError;

      toast({
        title: "Success",
        description: "Form submitted successfully",
      });

      // Reset form
      setFormData({});
      setSelectedGroup("");
      
      // Reset any form fields
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
    }
  };

  if (loading) {
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

            <div className="space-y-2">
              <Label htmlFor="group-select">Select Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger id="group-select">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Card>
    </div>
  );
}