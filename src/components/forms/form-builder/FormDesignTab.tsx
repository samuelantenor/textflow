import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormPreview } from "../FormPreview";
import { FONT_OPTIONS } from "./constants";
import { Palette, Save, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FormDesignTabProps {
  form: UseFormReturn<any>;
  handleLogoUpload: (file: File) => Promise<void>;
  formId?: string;
}

const GRADIENTS = [
  "linear-gradient(to right, #ee9ca7, #ffdde1)",
  "linear-gradient(to right, #2193b0, #6dd5ed)",
  "linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)",
  "linear-gradient(to right, #8e2de2, #4a00e0)",
  "linear-gradient(to right, #f953c6, #b91d73)",
];

export function FormDesignTab({ form, handleLogoUpload, formId }: FormDesignTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [borderRadius, setBorderRadius] = useState(8);
  const [useGradient, setUseGradient] = useState(false);
  const { toast } = useToast();
  const formData = form.watch();

  const handleColorChange = (field: string, value: string) => {
    form.setValue(field, value, { shouldDirty: true });
  };

  const applyRandomDesign = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    const randomGradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    const randomFont = FONT_OPTIONS[Math.floor(Math.random() * FONT_OPTIONS.length)].value;
    
    form.setValue("primary_color", randomColor);
    form.setValue("background_color", useGradient ? randomGradient : randomColor);
    form.setValue("font_family", randomFont);
    setBorderRadius(Math.floor(Math.random() * 20));
    
    toast({
      title: "Design Updated",
      description: "A new random design has been applied!",
    });
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
          <div className="flex justify-between items-center mb-4">
            <Button 
              onClick={applyRandomDesign}
              size="sm"
              variant="outline"
              className="group hover:border-primary/50"
            >
              <Wand2 className="w-4 h-4 mr-2 group-hover:rotate-45 transition-transform duration-200" />
              Random Design
            </Button>
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

          <div className="space-y-6 p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Colors & Gradients</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Use Gradient Background</Label>
                  <Switch
                    checked={useGradient}
                    onCheckedChange={setUseGradient}
                  />
                </div>
                
                {useGradient ? (
                  <div className="space-y-2">
                    <Label>Background Gradient</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {GRADIENTS.map((gradient, index) => (
                        <div
                          key={index}
                          className={cn(
                            "h-12 rounded-md cursor-pointer transition-all duration-200 hover:scale-105",
                            formData.background_color === gradient && "ring-2 ring-primary"
                          )}
                          style={{ background: gradient }}
                          onClick={() => handleColorChange("background_color", gradient)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
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
                )}

                <div className="space-y-2">
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
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Typography</Label>
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
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Border Radius</Label>
              <div className="space-y-4">
                <Slider
                  value={[borderRadius]}
                  onValueChange={(value) => setBorderRadius(value[0])}
                  max={20}
                  step={1}
                />
                <div className="text-sm text-muted-foreground text-center">
                  {borderRadius}px
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
                className="cursor-pointer"
              />
              {formData.logo_url && (
                <div className="mt-2">
                  <img
                    src={formData.logo_url}
                    alt="Form logo"
                    className="max-h-20 rounded-lg object-contain"
                  />
                </div>
              )}
            </div>
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
            borderRadius: borderRadius,
          }}
        />
      </ScrollArea>
    </div>
  );
}