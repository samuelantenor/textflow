import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "./ColorPicker";
import { UseFormReturn } from "react-hook-form";

interface InputStyleSectionProps {
  form: UseFormReturn<any>;
}

export function InputStyleSection({ form }: InputStyleSectionProps) {
  const formData = form.watch();

  return (
    <div className="space-y-6">
      <ColorPicker
        label="Input Background Color"
        value={formData.input_background_color || "#FFFFFF"}
        onChange={(value) => form.setValue("input_background_color", value)}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Show Border</Label>
          <Switch
            checked={formData.show_border}
            onCheckedChange={(checked) => form.setValue("show_border", checked)}
          />
        </div>
      </div>
    </div>
  );
}