import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          className="w-12 h-12 p-1 cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          type="text"
          className="flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}