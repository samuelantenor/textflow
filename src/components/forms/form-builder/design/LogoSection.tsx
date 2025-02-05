import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface LogoSectionProps {
  form: UseFormReturn<any>;
  onLogoUpload: (file: File) => Promise<void>;
}

export function LogoSection({ form, onLogoUpload }: LogoSectionProps) {
  const { t } = useTranslation("forms");
  const formData = form.watch();

  return (
    <div className="space-y-4">
      <Label>{t("design.logo.title")}</Label>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onLogoUpload(file);
        }}
      />
      {formData.logo_url && (
        <div className="mt-2">
          <img
            src={formData.logo_url}
            alt={t("design.logo.title")}
            className="max-h-20 rounded"
          />
        </div>
      )}
    </div>
  );
}