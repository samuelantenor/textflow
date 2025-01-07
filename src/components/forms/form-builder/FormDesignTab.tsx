import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormPreview } from "../FormPreview";
import { FONT_OPTIONS } from "./constants";
import { Palette, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FormDesignTabProps {
  form: UseFormReturn<any>;
  handleLogoUpload: (file: File) => Promise<void>;
  formId?: string;
}

export function FormDesignTab({ form, handleLogoUpload, formId }: FormDesignTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const formData = form.watch();

  const handleColorChange = (field: string, value: string) => {
    form.setValue(field, value, { shouldDirty: true });
  };

  const handleSaveDesign = async () => {
    if (!formId) {
      toast({
        title: "Error",
        description: "Please save the form first before updating the design.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('custom_forms')
        .update({
          background_color: formData.background_color,
          font_family: formData.font_family,
          logo_url: formData.logo_url,
          primary_color: formData.primary_color,
        })
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form design has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving form design:', error);
      toast({
        title: "Error",
        description: "Failed to save form design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      <ScrollArea className="h-[calc(90vh-220px)]">
        <div className="space-y-6 pr-4">
          <div className="flex justify-end mb-4">
            <Button 
              onClick={handleSaveDesign} 
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? "Saving..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Design
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-12 p-1 cursor-pointer"
                value={formData.background_color}
                onChange={(e) => handleColorChange("background_color", e.target.value)}
              />
              <Input
                type="text"
                className="flex-1"
                value={formData.background_color}
                onChange={(e) => handleColorChange("background_color", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-12 p-1 cursor-pointer"
                value={formData.primary_color}
                onChange={(e) => handleColorChange("primary_color", e.target.value)}
              />
              <Input
                type="text"
                className="flex-1"
                value={formData.primary_color}
                onChange={(e) => handleColorChange("primary_color", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Font Family</Label>
            <Select
              value={formData.font_family}
              onValueChange={(value) => form.setValue("font_family", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Logo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }}
            />
            {formData.logo_url && (
              <div className="mt-2">
                <img
                  src={formData.logo_url}
                  alt="Form logo"
                  className="max-h-20 rounded"
                />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      <ScrollArea className="h-[calc(90vh-220px)]">
        <FormPreview
          title={formData.title}
          description={formData.description}
          fields={formData.fields}
          customization={{
            backgroundColor: formData.background_color,
            fontFamily: formData.font_family,
            logoUrl: formData.logo_url,
            primaryColor: formData.primary_color,
          }}
        />
      </ScrollArea>
    </div>
  );
}