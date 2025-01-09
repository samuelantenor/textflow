import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { FormFieldsTab } from "./form-builder/FormFieldsTab";
import { FormDesignTab } from "./form-builder/FormDesignTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EditFormDialog({ form: initialForm, open, onOpenChange }: EditFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      title: initialForm.title,
      description: initialForm.description || "",
      fields: initialForm.fields || [],
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
    },
  });

  // Reset form values when the initial form or dialog open state changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: initialForm.title,
        description: initialForm.description || "",
        fields: initialForm.fields || [],
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
      });
    }
  }, [initialForm, open, form]);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("custom_forms")
        .update({ ...data })
        .eq("id", initialForm.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["custom-forms"] });

      toast({
        title: "Success",
        description: "Form updated successfully.",
      });

      onOpenChange(false);
    } catch (error) {
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
      <DialogContent className="sm:max-w-[1200px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Form: {initialForm.title}</DialogTitle>
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
                <FormDesignTab form={form} formId={initialForm.id} />
              </TabsContent>
            </Tabs>
            <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-background p-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
