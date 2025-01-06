import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Loader2 } from "lucide-react";
import { FormFieldBuilder } from "./FormFieldBuilder";
import { FormFieldList } from "./FormFieldList";

interface FormBuilderProps {
  groupId: string;
}

interface FormData {
  title: string;
  description?: string;
  fields: Array<{
    type: 'text' | 'email' | 'phone' | 'checkbox' | 'textarea' | 'number' | 'date' | 'radio' | 'select';
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    description?: string;
  }>;
}

export function FormBuilder({ groupId }: FormBuilderProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      fields: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("custom_forms").insert({
        user_id: session.user.id,
        group_id: groupId,
        title: data.title,
        description: data.description,
        fields: data.fields,
      });

      if (error) throw error;

      toast({
        title: "Form created",
        description: "Your custom form has been created successfully.",
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating form:", error);
      toast({
        title: "Error",
        description: "Failed to create form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Form
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Custom Form</DialogTitle>
          <DialogDescription>
            Build a beautiful form to collect information from your contacts.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-4 bg-muted/50 rounded-lg p-4">
              <Input
                placeholder="Enter form title"
                className="text-xl font-semibold bg-background"
                {...form.register("title", { required: true })}
              />
              <Textarea
                placeholder="Describe your form (optional)"
                className="bg-background"
                {...form.register("description")}
              />
            </div>
            <FormFieldBuilder form={form} />
            <FormFieldList form={form} />
            <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-background p-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                Save Form
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}