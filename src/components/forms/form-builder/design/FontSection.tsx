import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FONT_OPTIONS } from "../constants";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface FontSectionProps {
  form: UseFormReturn<any>;
}

export function FontSection({ form }: FontSectionProps) {
  const { t } = useTranslation("forms");
  const formData = form.watch();

  return (
    <div className="space-y-4">
      <Label>{t("design.font.family")}</Label>
      <Select
        value={formData.font_family}
        onValueChange={(value) => form.setValue("font_family", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("design.font.family")} />
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
  );
}