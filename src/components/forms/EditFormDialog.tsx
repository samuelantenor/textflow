import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("general");
  
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
      const formValues = {
        title: initialForm.title,
        description: initialForm.description || "",
        fields: initialForm.fields,
        group_id: initialForm.group_id || "",
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] h-[90vh] flex flex-col">
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
                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Form Title</Label>
                      <Input {...form.register("title")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input {...form.register("description")} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        {...form.register("primary_color")}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Submit Button Color</Label>
                      <Input
                        type="color"
                        {...form.register("submit_button_color")}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select
                        value={form.watch("font_family")}
                        onValueChange={(value) => form.setValue("font_family", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Logo</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      {form.watch("logo_url") && (
                        <img
                          src={form.watch("logo_url")}
                          alt="Form logo"
                          className="h-20 object-contain"
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="background" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Form Background Color</Label>
                      <Input
                        type="color"
                        {...form.register("background_color")}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Input Background Color</Label>
                      <Input
                        type="color"
                        {...form.register("input_background_color")}
                        className="h-10"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Input Borders</Label>
                      <Switch
                        checked={form.watch("show_border")}
                        onCheckedChange={(checked) => form.setValue("show_border", checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website Background Color</Label>
                      <Input
                        type="color"
                        {...form.register("website_background_color")}
                        className="h-10"
                      />
                    </div>
                  </div>
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