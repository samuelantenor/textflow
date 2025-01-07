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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { FormFieldsTab } from "./form-builder/FormFieldsTab";
import { FormDesignTab } from "./form-builder/FormDesignTab";

interface FormBuilderProps {
  groupId?: string;
}

interface FormData {
  title: string;
  description?: string;
  group_id: string;
  background_color?: string;
  font_family?: string;
  logo_url?: string;
  primary_color?: string;
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
  const [activeTab, setActiveTab] = useState("fields");
  const [formId, setFormId] = useState<string | undefined>();
  const { toast } = useToast();
  const form = useForm<FormData>({
    defaultValues: {
      fields: [],
      group_id: groupId || "",
      background_color: "#FFFFFF",
      font_family: "Inter",
      primary_color: "#ea384c",
    },
  });

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("landing_page_assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("landing_page_assets")
        .getPublicUrl(fileName);
      
      form.setValue("logo_url", publicUrl);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { data: formData, error } = await supabase.from("custom_forms").insert({
        user_id: session.user.id,
        group_id: data.group_id,
        title: data.title,
        description: data.description,
        fields: data.fields,
        background_color: data.background_color,
        font_family: data.font_family,
        logo_url: data.logo_url,
        primary_color: data.primary_color,
      }).select().single();

      if (error) throw error;

      setFormId(formData.id);

      toast({
        title: "Form created",
        description: "Your custom form has been created successfully.",
      });

      // Don't close the dialog after creation so user can continue designing
      if (activeTab === "fields") {
        setActiveTab("design");
      }
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
      <DialogContent className="sm:max-w-[1200px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Custom Form</DialogTitle>
          <DialogDescription>
            Build a beautiful form to collect information from your contacts.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="fields">Form Fields</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="flex-1 overflow-hidden">
                <FormFieldsTab form={form} />
              </TabsContent>

              <TabsContent value="design" className="flex-1 overflow-hidden">
                <FormDesignTab form={form} handleLogoUpload={handleLogoUpload} formId={formId} />
              </TabsContent>
            </Tabs>

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