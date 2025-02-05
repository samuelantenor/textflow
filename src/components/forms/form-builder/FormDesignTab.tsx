import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormPreview } from "../FormPreview";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "./design/ColorPicker";
import { BackgroundSection } from "./design/BackgroundSection";
import { InputStyleSection } from "./design/InputStyleSection";
import { LogoSection } from "./design/LogoSection";
import { FontSection } from "./design/FontSection";
import { useTranslation } from "react-i18next";

interface FormDesignTabProps {
  form: UseFormReturn<any>;
  handleLogoUpload: (file: File) => Promise<void>;
  formId?: string;
}

export function FormDesignTab({ form, handleLogoUpload, formId }: FormDesignTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation("forms");
  const formData = form.watch();

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
      console.error('Error uploading background image:', error);
      toast({
        title: t("design.background.image.error"),
        description: t("design.background.image.error"),
        variant: "destructive",
      });
    }
  };

  const handleSaveDesign = async () => {
    if (!formId) {
      toast({
        title: t("design.error"),
        description: t("design.saveFirst"),
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
        title: t("design.success"),
        description: t("design.success"),
      });
    } catch (error) {
      console.error('Error saving form design:', error);
      toast({
        title: t("design.error"),
        description: t("design.error"),
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
              {isSaving ? t("design.saving") : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("design.saveButton")}
                </>
              )}
            </Button>
          </div>

          <ColorPicker
            label={t("design.colors.primary")}
            value={formData.primary_color}
            onChange={(value) => form.setValue("primary_color", value)}
          />

          <BackgroundSection
            form={form}
            onBackgroundImageUpload={handleBackgroundImageUpload}
          />

          <InputStyleSection form={form} />
          <FontSection form={form} />
          <LogoSection form={form} onLogoUpload={handleLogoUpload} />
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