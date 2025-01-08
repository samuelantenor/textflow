import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormPreview } from "../FormPreview";
import { FONT_OPTIONS } from "./constants";
import { Palette, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormDesignTabProps {
  form: UseFormReturn<any>;
  handleLogoUpload: (file: File) => Promise<void>;
  formId?: string;
}

export function FormDesignTab({ form, handleLogoUpload, formId }: FormDesignTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const formData = form.watch();
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);

  const handleColorChange = (field: string, value: string) => {
    form.setValue(field, value, { shouldDirty: true });
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
      setBackgroundImage(file);
    } catch (error) {
      console.error('Error uploading background image:', error);
      toast({
        title: "Error",
        description: "Failed to upload background image. Please try again.",
        variant: "destructive",
      });
    }
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
          background_image_url: formData.background_image_url,
          background_image_style: formData.background_image_style,
          background_opacity: formData.background_opacity,
          input_background_color: formData.input_background_color,
          show_border: formData.show_border,
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
            <Label>Input Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-12 p-1 cursor-pointer"
                value={formData.input_background_color || "#FFFFFF"}
                onChange={(e) => handleColorChange("input_background_color", e.target.value)}
              />
              <Input
                type="text"
                className="flex-1"
                value={formData.input_background_color || "#FFFFFF"}
                onChange={(e) => handleColorChange("input_background_color", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Primary Color (Buttons & Accents)</Label>
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
            <Label>Background Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleBackgroundImageUpload(file);
              }}
            />
            {formData.background_image_url && (
              <div className="mt-2">
                <Label>Background Image Style</Label>
                <RadioGroup
                  value={formData.background_image_style || "cover"}
                  onValueChange={(value) => form.setValue("background_image_style", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cover" id="cover" />
                    <Label htmlFor="cover">Cover</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="contain" id="contain" />
                    <Label htmlFor="contain">Contain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="repeat" id="repeat" />
                    <Label htmlFor="repeat">Mosaic (Repeat)</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Background Opacity</Label>
            <Slider
              value={[formData.background_opacity || 100]}
              onValueChange={([value]) => form.setValue("background_opacity", value)}
              max={100}
              step={1}
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.background_opacity || 100}%
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
            <div className="flex items-center justify-between">
              <Label>Show Border</Label>
              <Switch
                checked={formData.show_border}
                onCheckedChange={(checked) => form.setValue("show_border", checked)}
              />
            </div>
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
            backgroundImageUrl: formData.background_image_url,
            backgroundImageStyle: formData.background_image_style,
            backgroundOpacity: formData.background_opacity,
            inputBackgroundColor: formData.input_background_color,
            showBorder: formData.show_border,
          }}
        />
      </ScrollArea>
    </div>
  );
}