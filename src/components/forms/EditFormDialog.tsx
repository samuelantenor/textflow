import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Store last customization settings in memory
let lastCustomizationSettings = {
  background_color: "#FFFFFF",
  font_family: "Inter",
  logo_url: null,
  primary_color: "#ea384c",
  submit_button_color: "#ea384c",
  background_image_url: null,
  background_image_style: "cover",
  input_background_color: "#FFFFFF",
  show_border: true,
  website_background_color: "#FFFFFF",
  website_background_gradient: null,
  website_background_image_url: null,
  website_background_style: "color",
};

interface EditFormDialogProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    fields: any[];
    group_id: string;
    background_color?: string;
    font_family?: string;
    logo_url?: string;
    primary_color?: string;
    submit_button_color?: string;
    background_image_url?: string;
    background_image_style?: string;
    input_background_color?: string;
    show_border?: boolean;
    website_background_color?: string;
    website_background_gradient?: string;
    website_background_image_url?: string;
    website_background_style?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFormDialog({ form: initialForm, open, onOpenChange }: EditFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      fields: [],
      group_id: "",
      ...lastCustomizationSettings
    },
  });

  // Reset form values when initialForm changes or dialog opens
  useEffect(() => {
    if (open && initialForm) {
      // Merge initial form data with last customization settings
      const formValues = {
        title: initialForm.title,
        description: initialForm.description || "",
        fields: initialForm.fields,
        group_id: initialForm.group_id || "",
        // Use last customization settings as fallback
        background_color: initialForm.background_color || lastCustomizationSettings.background_color,
        font_family: initialForm.font_family || lastCustomizationSettings.font_family,
        logo_url: initialForm.logo_url || lastCustomizationSettings.logo_url,
        primary_color: initialForm.primary_color || lastCustomizationSettings.primary_color,
        submit_button_color: initialForm.submit_button_color || lastCustomizationSettings.submit_button_color,
        background_image_url: initialForm.background_image_url || lastCustomizationSettings.background_image_url,
        background_image_style: initialForm.background_image_style || lastCustomizationSettings.background_image_style,
        input_background_color: initialForm.input_background_color || lastCustomizationSettings.input_background_color,
        show_border: initialForm.show_border ?? lastCustomizationSettings.show_border,
        website_background_color: initialForm.website_background_color || lastCustomizationSettings.website_background_color,
        website_background_gradient: initialForm.website_background_gradient || lastCustomizationSettings.website_background_gradient,
        website_background_image_url: initialForm.website_background_image_url || lastCustomizationSettings.website_background_image_url,
        website_background_style: initialForm.website_background_style || lastCustomizationSettings.website_background_style,
      };
      form.reset(formValues);
    }
  }, [initialForm, open, form]);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      // Update last customization settings
      lastCustomizationSettings = {
        background_color: data.background_color,
        font_family: data.font_family,
        logo_url: data.logo_url,
        primary_color: data.primary_color,
        submit_button_color: data.submit_button_color,
        background_image_url: data.background_image_url,
        background_image_style: data.background_image_style,
        input_background_color: data.input_background_color,
        show_border: data.show_border,
        website_background_color: data.website_background_color,
        website_background_gradient: data.website_background_gradient,
        website_background_image_url: data.website_background_image_url,
        website_background_style: data.website_background_style,
      };

      const { error } = await supabase
        .from("custom_forms")
        .update({
          title: data.title,
          description: data.description,
          fields: data.fields,
          group_id: data.group_id,
          ...lastCustomizationSettings
        })
        .eq('id', initialForm.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['custom-forms'] });

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
      <DialogContent className="sm:max-w-[1200px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Form: {initialForm.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden">
            <div className="flex flex-col space-y-4">
              <label>Submit Button Color</label>
              <input
                type="color"
                {...form.register("submit_button_color")}
                className="w-full h-10 border rounded"
              />
            </div>
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
