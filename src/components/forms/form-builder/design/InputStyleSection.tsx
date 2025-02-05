import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "./ColorPicker";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface InputStyleSectionProps {
  form: UseFormReturn<any>;
}

export function InputStyleSection({ form }: InputStyleSectionProps) {
  const { t } = useTranslation("forms");
  const formData = form.watch();

  return (
    <div className="space-y-6">
      <ColorPicker
        label={t("design.colors.input")}
        value={formData.input_background_color || "#FFFFFF"}
        onChange={(value) => form.setValue("input_background_color", value)}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t("design.border.label")}</Label>
          <Switch
            checked={formData.show_border}
            onCheckedChange={(checked) => form.setValue("show_border", checked)}
          />
        </div>
      </div>
    </div>
  );
}