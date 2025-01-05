import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  const fonts = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Montserrat",
    "Poppins",
  ];

  return (
    <div className="space-y-2">
      <Label>Font Family</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fonts.map((font) => (
            <SelectItem key={font} value={font}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}