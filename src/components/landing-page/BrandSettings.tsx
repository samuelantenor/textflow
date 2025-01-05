import { ColorPicker } from "./ColorPicker";
import { FontSelector } from "./FontSelector";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface BrandSettingsProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  selectedFont: string;
  borderRadius: number;
  spacing: number;
  onColorChange: (type: string, color: string) => void;
  onFontChange: (font: string) => void;
  onBorderRadiusChange: (value: number) => void;
  onSpacingChange: (value: number) => void;
}

export function BrandSettings({
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  textColor,
  selectedFont,
  borderRadius,
  spacing,
  onColorChange,
  onFontChange,
  onBorderRadiusChange,
  onSpacingChange,
}: BrandSettingsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Brand Settings</h3>
      <Tabs defaultValue="colors">
        <TabsList className="mb-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <ColorPicker
            value={primaryColor}
            onChange={(color) => onColorChange('primary', color)}
            label="Primary Color"
          />
          <ColorPicker
            value={secondaryColor}
            onChange={(color) => onColorChange('secondary', color)}
            label="Secondary Color"
          />
          <ColorPicker
            value={accentColor}
            onChange={(color) => onColorChange('accent', color)}
            label="Accent Color"
          />
          <ColorPicker
            value={backgroundColor}
            onChange={(color) => onColorChange('background', color)}
            label="Background Color"
          />
          <ColorPicker
            value={textColor}
            onChange={(color) => onColorChange('text', color)}
            label="Text Color"
          />
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <FontSelector
            value={selectedFont}
            onChange={onFontChange}
          />
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Slider
              value={[borderRadius]}
              onValueChange={(values) => onBorderRadiusChange(values[0])}
              min={0}
              max={20}
              step={1}
            />
            <div className="text-sm text-muted-foreground">
              {borderRadius}px
            </div>
          </div>

          <div className="space-y-2">
            <Label>Element Spacing</Label>
            <Slider
              value={[spacing]}
              onValueChange={(values) => onSpacingChange(values[0])}
              min={4}
              max={24}
              step={2}
            />
            <div className="text-sm text-muted-foreground">
              {spacing}px
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}