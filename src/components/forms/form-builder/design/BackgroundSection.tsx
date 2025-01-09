import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "./ColorPicker";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";

const gradients = [
  { name: "Sunset", value: "linear-gradient(90deg, hsla(24, 100%, 83%, 1) 0%, hsla(341, 91%, 68%, 1) 100%)" },
  { name: "Ocean", value: "linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%)" },
  { name: "Forest", value: "linear-gradient(90deg, hsla(59, 86%, 68%, 1) 0%, hsla(134, 36%, 53%, 1) 100%)" },
  { name: "Purple Haze", value: "linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)" },
  { name: "Warm Sand", value: "linear-gradient(90deg, hsla(39, 100%, 77%, 1) 0%, hsla(22, 90%, 57%, 1) 100%)" },
  { name: "Cool Mint", value: "linear-gradient(90deg, hsla(46, 73%, 75%, 1) 0%, hsla(176, 73%, 88%, 1) 100%)" },
  { name: "Peach", value: "linear-gradient(90deg, rgb(245,152,168) 0%, rgb(246,237,178) 100%)" },
  { name: "Deep Blue", value: "linear-gradient(to right, #243949 0%, #517fa4 100%)" },
];

interface BackgroundSectionProps {
  form: UseFormReturn<any>;
  onBackgroundImageUpload: (file: File) => Promise<void>;
}

export function BackgroundSection({ form, onBackgroundImageUpload }: BackgroundSectionProps) {
  const formData = form.watch();

  const handleGradientSelect = (gradient: string) => {
    form.setValue("background_color", gradient);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Background Style</Label>
        <RadioGroup
          value={formData.background_style || "color"}
          onValueChange={(value) => form.setValue("background_style", value)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="color" id="color" />
            <Label htmlFor="color">Solid Color</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gradient" id="gradient" />
            <Label htmlFor="gradient">Gradient</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="image" id="image" />
            <Label htmlFor="image">Image</Label>
          </div>
        </RadioGroup>
      </div>

      {formData.background_style === "color" && (
        <ColorPicker
          label="Background Color"
          value={formData.background_color}
          onChange={(value) => form.setValue("background_color", value)}
        />
      )}

      {formData.background_style === "gradient" && (
        <div className="space-y-4">
          <Label>Select Gradient</Label>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="grid grid-cols-2 gap-4">
              {gradients.map((gradient, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 relative overflow-hidden"
                  style={{ background: gradient.value }}
                  onClick={() => handleGradientSelect(gradient.value)}
                >
                  <span className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                    {gradient.name}
                  </span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {formData.background_style === "image" && (
        <div className="space-y-4">
          <Label>Background Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onBackgroundImageUpload(file);
            }}
          />
          {formData.background_image_url && (
            <>
              <Label>Background Image Style</Label>
              <RadioGroup
                value={formData.background_image_style || "cover"}
                onValueChange={(value) => form.setValue("background_image_style", value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cover" id="cover" />
                  <Label htmlFor="cover">Cover</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contain" id="contain" />
                  <Label htmlFor="contain">Contain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="repeat" id="repeat" />
                  <Label htmlFor="repeat">Mosaic (Repeat)</Label>
                </div>
              </RadioGroup>
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        <Label>Background Opacity</Label>
        <Slider
          value={[formData.background_opacity || 100]}
          onValueChange={([value]) => form.setValue("background_opacity", value)}
          max={100}
          step={1}
        />
        <div className="text-sm text-muted-foreground text-right">
          {formData.background_opacity || 100}%
        </div>
      </div>
    </div>
  );
}