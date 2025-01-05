import { ColorPicker } from "./ColorPicker";
import { FontSelector } from "./FontSelector";

interface BrandSettingsProps {
  primaryColor: string;
  selectedFont: string;
  onColorChange: (color: string) => void;
  onFontChange: (font: string) => void;
}

export function BrandSettings({
  primaryColor,
  selectedFont,
  onColorChange,
  onFontChange,
}: BrandSettingsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Brand Settings</h3>
      <div className="space-y-3">
        <ColorPicker
          value={primaryColor}
          onChange={onColorChange}
          label="Primary Color"
        />
        <FontSelector
          value={selectedFont}
          onChange={onFontChange}
        />
      </div>
    </div>
  );
}