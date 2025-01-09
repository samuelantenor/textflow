import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormGeneralSection } from "./form-builder/general/FormGeneralSection";
import { FormDesignSection } from "./form-builder/design/FormDesignSection";
import { FormBackgroundSection } from "./form-builder/background/FormBackgroundSection";
import { FormData, CustomForm } from "./types";

interface EditFormDialogProps {
  form: CustomForm;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFormDialog({ form: initialForm, open, onOpenChange }: EditFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    defaultValues: {
      title: initialForm.title,
      description: initialForm.description || "",
      fields: initialForm.fields,
      group_id: initialForm.group_id,
      background_color: initialForm.background_color || "#FFFFFF",
      font_family: initialForm.font_family || "Inter",
      logo_url: initialForm.logo_url || null,
      primary_color: initialForm.primary_color || "#ea384c",
      submit_button_color: initialForm.submit_button_color || "#ea384c",
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

  const handleBackgroundImageUpload = async (file: File) => {
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
      
      form.setValue("background_image_url", publicUrl);
    } catch (error) {
      console.error("Error uploading background image:", error);
      toast({
        title: "Error",
        description: "Failed to upload background image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWebsiteBackgroundImageUpload = async (file: File) => {
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
      
      form.setValue("website_background_image_url", publicUrl);
    } catch (error) {
      console.error("Error uploading website background image:", error);
      toast({
        title: "Error",
        description: "Failed to upload website background image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("custom_forms")
        .update({
          title: data.title,
          description: data.description,
          fields: data.fields,
          background_color: data.background_color,
          font_family: data.font_family,
          logo_url: data.logo_url,
          primary_color: data.primary_color,
          submit_button_color: data.submit_button_color,
          background_image_url: data.background_image_url,
          background_image_style: data.background_image_style,
          background_opacity: data.background_opacity,
          input_background_color: data.input_background_color,
          show_border: data.show_border,
          website_background_color: data.website_background_color,
          website_background_gradient: data.website_background_gradient,
          website_background_image_url: data.website_background_image_url,
          website_background_style: data.website_background_style,
        })
        .eq('id', initialForm.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form updated successfully.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating form:", error);
      toast({
        title: "Error",
        description: "Failed to update form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Form: {initialForm.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-1">
                <TabsContent value="general" className="mt-4">
                  <FormGeneralSection form={form} />
                </TabsContent>

                <TabsContent value="design" className="mt-4">
                  <FormDesignSection 
                    form={form}
                    onLogoUpload={handleLogoUpload}
                  />
                </TabsContent>

                <TabsContent value="background" className="mt-4">
                  <FormBackgroundSection
                    form={form}
                    onBackgroundImageUpload={handleBackgroundImageUpload}
                    onWebsiteBackgroundImageUpload={handleWebsiteBackgroundImageUpload}
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-background p-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}