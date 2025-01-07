import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormPreview } from "../FormPreview";
import { FONT_OPTIONS } from "./constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface FormDesignTabProps {
  form: UseFormReturn<any>;
  handleLogoUpload: (file: File) => Promise<void>;
}

const PRESET_COLORS = [
  "#FFFFFF", // White
  "#000000", // Black
  "#ea384c", // Red (Primary)
  "#9b87f5", // Purple
  "#0EA5E9", // Blue
  "#22C55E", // Green
  "#F97316", // Orange
  "#A855F7", // Purple
  "#EC4899", // Pink
];

export function FormDesignTab({ form, handleLogoUpload }: FormDesignTabProps) {
  const formData = form.watch();

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <div className="space-y-4">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-12 h-12 p-1"
              style={{ backgroundColor: value }}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64" 
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-12 h-12 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.preventDefault();
                      onChange(color);
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="w-12 h-12 p-1"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                <Input
                  type="text"
                  className="flex-1"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      <ScrollArea className="h-[calc(90vh-220px)]">
        <div className="space-y-6 pr-4">
          <ColorPicker
            label="Background Color"
            value={form.watch("background_color")}
            onChange={(value) => form.setValue("background_color", value)}
          />

          <ColorPicker
            label="Primary Color"
            value={form.watch("primary_color")}
            onChange={(value) => form.setValue("primary_color", value)}
          />

          <div className="space-y-4">
            <Label>Font Family</Label>
            <Select
              value={form.watch("font_family")}
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

          <div className="space-y-4">
            <Label>Logo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
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
        </div>
      </ScrollArea>
      <ScrollArea className="h-[calc(90vh-220px)]">
        <FormPreview
          title={formData.title}
          description={formData.description}
          fields={formData.fields}
          customization={{
            backgroundColor: formData.background_color,
            fontFamily: formData.font_family,
            logoUrl: formData.logo_url,
            primaryColor: formData.primary_color,
          }}
        />
      </ScrollArea>
    </div>
  );
}