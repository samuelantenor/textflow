import { UseFormReturn } from "react-hook-form";
import { BackgroundSection } from "../design/BackgroundSection";
import { InputStyleSection } from "../design/InputStyleSection";

interface FormBackgroundSectionProps {
  form: UseFormReturn<any>;
  onBackgroundImageUpload: (file: File) => Promise<void>;
  onWebsiteBackgroundImageUpload: (file: File) => Promise<void>;
}

export function FormBackgroundSection({ 
  form, 
  onBackgroundImageUpload,
  onWebsiteBackgroundImageUpload 
}: FormBackgroundSectionProps) {
  return (
    <div className="space-y-6">
      <BackgroundSection
        form={form}
        onBackgroundImageUpload={onBackgroundImageUpload}
        onWebsiteBackgroundImageUpload={onWebsiteBackgroundImageUpload}
      />
      <InputStyleSection form={form} />
    </div>
  );
}