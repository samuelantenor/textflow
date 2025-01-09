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
import { FormFieldsTab } from "./form-builder/FormFieldsTab";
import { FormDesignTab } from "./form-builder/FormDesignTab";
import { FormData, CustomForm } from "./types";

interface EditFormDialogProps {
  form: CustomForm;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFormDialog({ form: initialForm, open, onOpenChange }: EditFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
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
      background_image_url: initialForm.background_image_url,
      background_image_style: initialForm.background_image_style,
      background_opacity: initialForm.background_opacity,
      input_background_color: initialForm.input_background_color,
      show_border: initialForm.show_border,
      website_background_color: initialForm.website_background_color,
      website_background_gradient: initialForm.website_background_gradient,
      website_background_image_url: initialForm.website_background_image_url,
      website_background_style: initialForm.website_background_style,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("custom_forms")
        .update({
          title: data.title,
          description: data.description,
          fields: data.fields,
          group_id: data.group_id,
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList>
                <TabsTrigger value="fields">Form Fields</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="flex-1 overflow-hidden">
                <FormFieldsTab form={form} />
              </TabsContent>

              <TabsContent value="design" className="flex-1 overflow-hidden">
                <FormDesignTab form={form} formId={initialForm.id} />
              </TabsContent>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}