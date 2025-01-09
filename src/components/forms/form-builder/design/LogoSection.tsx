import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { X } from "lucide-react";

interface LogoSectionProps {
  form: UseFormReturn<any>;
  onLogoUpload: (file: File) => Promise<void>;
}

export function LogoSection({ form, onLogoUpload }: LogoSectionProps) {
  const formData = form.watch();

  const handleRemoveLogo = () => {
    form.setValue("logo_url", null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Logo</Label>
        {formData.logo_url && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveLogo}
          >
            <X className="w-4 h-4 mr-2" />
            Remove Logo
          </Button>
        )}
      </div>
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