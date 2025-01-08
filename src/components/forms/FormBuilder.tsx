import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormTabs } from "./form-builder/FormTabs";
import { FormActions } from "./form-builder/FormActions";
import { useQueryClient } from "@tanstack/react-query";

interface FormBuilderProps {
  groupId?: string;
}

export function FormBuilder({ groupId }: FormBuilderProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const [formId, setFormId] = useState<string>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      fields: [],
      group_id: groupId || "",
      background_color: "#FFFFFF",
      font_family: "Inter",
      logo_url: "",
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

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("custom_forms")
        .insert({
          title: data.title,
          description: data.description,
          fields: data.fields,
          group_id: data.group_id,
          background_color: data.background_color,
          font_family: data.font_family,
          logo_url: data.logo_url,
          primary_color: data.primary_color,
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['custom-forms'] });

      toast({
        title: "Success",
        description: "Form created successfully.",
      });

      setOpen(false);
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
          <DialogTitle>Create Form</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden">
            <FormTabs
              form={form}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleLogoUpload={handleLogoUpload}
              formId={formId}
            />
            <FormActions
              isLoading={isLoading}
              onCancel={() => setOpen(false)}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}