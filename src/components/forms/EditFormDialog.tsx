
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { FormFieldsTab } from "./form-builder/FormFieldsTab";
import { FormDesignTab } from "./form-builder/FormDesignTab";
import { FormMessagesTab } from "./form-builder/FormMessagesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomForm } from "./types";
import { useTranslation } from "react-i18next";

interface EditFormDialogProps {
  form: CustomForm;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFormDialog({ form: initialForm, open, onOpenChange }: EditFormDialogProps) {
  const { t } = useTranslation("forms");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"fields" | "design" | "messages">("fields");
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      title: initialForm.title,
      description: initialForm.description || "",
      fields: Array.isArray(initialForm.fields) ? initialForm.fields : [],
      group_id: initialForm.group_id,
      background_color: initialForm.background_color || "#FFFFFF",
      font_family: initialForm.font_family || "Inter",
      logo_url: initialForm.logo_url,
      primary_color: initialForm.primary_color || "#ea384c",
      background_image_url: initialForm.background_image_url,
      background_image_style: initialForm.background_image_style || "cover",
      background_opacity: initialForm.background_opacity || 100,
      input_background_color: initialForm.input_background_color || "#FFFFFF",
      show_border: initialForm.show_border ?? true,
      welcome_message_template: initialForm.welcome_message_template || {
        en: "Thank you for submitting the form '{title}'. We have received your response and will be in touch soon.",
        fr: "Merci d'avoir soumis le formulaire '{title}'. Nous avons bien reçu votre réponse et nous vous contacterons bientôt."
      }
    },
  });

  useEffect(() => {
    if (open) {
      const fetchForm = async () => {
        const { data, error } = await supabase
          .from("custom_forms")
          .select("*")
          .eq("id", initialForm.id)
          .single();
          
        if (!error && data) {
          // Ensure fields is an array before resetting the form
          const formData = {
            ...data,
            fields: Array.isArray(data.fields) ? data.fields : [],
            description: data.description || "",
          };
          
          // Only include fields that are in the form's defaultValues
          const sanitizedData = Object.keys(form.getValues()).reduce((acc, key) => {
            if (key in formData) {
              acc[key] = formData[key];
            }
            return acc;
          }, {} as any);
          
          form.reset(sanitizedData);
        }
      };
      fetchForm();
    }
  }, [open, initialForm.id, form]);

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("landing_page_assets")
        .upload(fileName, file);
      if (uploadError) throw new Error(t("design.logo.error"));

      const { data: { publicUrl } } = supabase.storage
        .from("landing_page_assets")
        .getPublicUrl(fileName);

      form.setValue("logo_url", publicUrl);
    } catch (error) {
      toast({
        title: t("design.logo.error"),
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      const sanitizedData = {
        title: data.title,
        description: data.description,
        fields: data.fields,
        group_id: data.group_id,
        background_color: data.background_color,
        font_family: data.font_family,
        logo_url: data.logo_url,
        primary_color: data.primary_color,
        background_image_url: data.background_image_url,
        background_image_style: data.background_image_style,
        background_opacity: data.background_opacity,
        input_background_color: data.input_background_color,
        show_border: data.show_border,
        welcome_message_template: data.welcome_message_template,
      };

      const { error } = await supabase
        .from("custom_forms")
        .update(sanitizedData)
        .eq("id", initialForm.id);

      if (error) throw error;

      toast({ 
        title: t("edit.success"), 
        description: t("edit.success") 
      });
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: t("edit.error"), 
        description: t("edit.error"), 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("edit.title")}: {initialForm.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={(tab: "fields" | "design" | "messages") => setActiveTab(tab)} className="h-full flex flex-col">
              <TabsList className="mb-4">
                <TabsTrigger value="fields">{t("builder.tabs.fields")}</TabsTrigger>
                <TabsTrigger value="design">{t("builder.tabs.design")}</TabsTrigger>
                <TabsTrigger value="messages">{t("builder.tabs.messages")}</TabsTrigger>
              </TabsList>
              <TabsContent value="fields" className="flex-1 overflow-hidden">
                <FormFieldsTab form={form} />
              </TabsContent>
              <TabsContent value="design" className="flex-1 overflow-hidden">
                <FormDesignTab form={form} handleLogoUpload={handleLogoUpload} formId={initialForm.id} />
              </TabsContent>
              <TabsContent value="messages" className="flex-1 overflow-hidden">
                <FormMessagesTab form={form} />
              </TabsContent>
            </Tabs>
            <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-background p-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("edit.buttons.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("edit.buttons.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
