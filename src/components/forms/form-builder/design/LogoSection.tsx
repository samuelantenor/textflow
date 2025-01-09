import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";

interface LogoSectionProps {
  form: UseFormReturn<any>;
  onLogoUpload: (file: File) => Promise<void>;
}

export function LogoSection({ form, onLogoUpload }: LogoSectionProps) {
  const formData = form.watch();

  return (
    <div className="space-y-4">
      <Label>Logo</Label>
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
            alt="Form logo"
            className="max-h-20 rounded"
          />
        </div>
      )}
    </div>
  );
}