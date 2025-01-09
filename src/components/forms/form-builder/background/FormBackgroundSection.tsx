import { UseFormReturn } from "react-hook-form";
import { FormData } from "../../types";
import { BackgroundSection } from "../design/BackgroundSection";
import { InputStyleSection } from "../design/InputStyleSection";

interface FormBackgroundSectionProps {
  form: UseFormReturn<FormData>;
  onWebsiteBackgroundImageUpload: (file: File) => Promise<void>;
}

export function FormBackgroundSection({ 
  form, 
  onWebsiteBackgroundImageUpload 
}: FormBackgroundSectionProps) {
  return (
    <div className="space-y-6">
      <BackgroundSection
        form={form}
        onWebsiteBackgroundImageUpload={onWebsiteBackgroundImageUpload}
      />
      <InputStyleSection form={form} />
    </div>
  );
}