import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FONT_OPTIONS } from "../constants";
import { UseFormReturn } from "react-hook-form";

interface FontSectionProps {
  form: UseFormReturn<any>;
}

export function FontSection({ form }: FontSectionProps) {
  const formData = form.watch();

  return (
    <div className="space-y-4">
      <Label>Font Family</Label>
      <Select
        value={formData.font_family}
        onValueChange={(value) => form.setValue("font_family", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a font" />
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