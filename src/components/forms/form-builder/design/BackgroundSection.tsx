import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "./ColorPicker";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface BackgroundSectionProps {
  form: UseFormReturn<any>;
  onBackgroundImageUpload: (file: File) => Promise<void>;
}

export function BackgroundSection({ form, onBackgroundImageUpload }: BackgroundSectionProps) {
  const { t } = useTranslation("forms");
  const formData = form.watch();

  return (
    <div className="space-y-6">
      <ColorPicker
        label={t("design.colors.background")}
        value={formData.background_color}
        onChange={(value) => form.setValue("background_color", value)}
      />

      <div className="space-y-4">
        <Label>{t("design.background.image.label")}</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onBackgroundImageUpload(file);
          }}
        />
        {formData.background_image_url && (
          <div className="mt-2">
            <Label>{t("design.background.style.label")}</Label>
            <RadioGroup
              value={formData.background_image_style || "cover"}
              onValueChange={(value) => form.setValue("background_image_style", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cover" id="cover" />
                <Label htmlFor="cover">{t("design.background.style.cover")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contain" id="contain" />
                <Label htmlFor="contain">{t("design.background.style.contain")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="repeat" id="repeat" />
                <Label htmlFor="repeat">{t("design.background.style.repeat")}</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label>{t("design.background.opacity")}</Label>
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
    </div>
  );
}