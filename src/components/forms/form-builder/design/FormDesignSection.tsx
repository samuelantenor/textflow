import { UseFormReturn } from "react-hook-form";
import { ColorPicker } from "./ColorPicker";
import { FontSection } from "./FontSection";
import { LogoSection } from "./LogoSection";

interface FormDesignSectionProps {
  form: UseFormReturn<any>;
  onLogoUpload: (file: File) => Promise<void>;
}

export function FormDesignSection({ form, onLogoUpload }: FormDesignSectionProps) {
  return (
    <div className="space-y-6">
      <ColorPicker
        label="Primary Color (Links & Accents)"
        value={form.watch("primary_color")}
        onChange={(value) => form.setValue("primary_color", value)}
      />

      <ColorPicker
        label="Submit Button Color"
        value={form.watch("submit_button_color")}
        onChange={(value) => form.setValue("submit_button_color", value)}
      />

      <FontSection form={form} />
      <LogoSection form={form} onLogoUpload={onLogoUpload} />
    </div>
  );
}