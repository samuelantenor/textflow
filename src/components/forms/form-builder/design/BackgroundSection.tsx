import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "./ColorPicker";
import { UseFormReturn } from "react-hook-form";
import { X } from "lucide-react";

interface BackgroundSectionProps {
  form: UseFormReturn<any>;
  onBackgroundImageUpload: (file: File) => Promise<void>;
  onWebsiteBackgroundImageUpload: (file: File) => Promise<void>;
}

export function BackgroundSection({ 
  form, 
  onBackgroundImageUpload,
  onWebsiteBackgroundImageUpload 
}: BackgroundSectionProps) {
  const formData = form.watch();

  const handleRemoveBackgroundImage = () => {
    form.setValue("background_image_url", null);
    form.setValue("background_image_style", "cover");
  };

  const handleRemoveWebsiteBackgroundImage = () => {
    form.setValue("website_background_image_url", null);
    form.setValue("website_background_style", "color");
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="form">
        <TabsList className="mb-4">
          <TabsTrigger value="form">Form Background</TabsTrigger>
          <TabsTrigger value="website">Website Background</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <ColorPicker
            label="Form Background Color"
            value={formData.background_color}
            onChange={(value) => form.setValue("background_color", value)}
          />

          <div className="space-y-4">
            <Label>Form Background Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onBackgroundImageUpload(file);
              }}
            />
            {formData.background_image_url && (
              <div className="mt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Background Image Style</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveBackgroundImage}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
                <RadioGroup
                  value={formData.background_image_style || "cover"}
                  onValueChange={(value) => form.setValue("background_image_style", value)}
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
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Form Background Opacity</Label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.background_opacity || 100}
              onChange={(e) => form.setValue("background_opacity", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.background_opacity || 100}%
            </div>
          </div>
        </TabsContent>

        <TabsContent value="website" className="space-y-6">
          <ColorPicker
            label="Website Background Color"
            value={formData.website_background_color}
            onChange={(value) => form.setValue("website_background_color", value)}
          />

          <div className="space-y-4">
            <Label>Website Background Style</Label>
            <RadioGroup
              value={formData.website_background_style || "color"}
              onValueChange={(value) => form.setValue("website_background_style", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="color" id="website-color" />
                <Label htmlFor="website-color">Solid Color</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gradient" id="website-gradient" />
                <Label htmlFor="website-gradient">Gradient</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="website-image" />
                <Label htmlFor="website-image">Image</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.website_background_style === 'gradient' && (
            <div className="space-y-4">
              <Label>Website Background Gradient</Label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                  'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
                  'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
                  'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)',
                ].map((gradient) => (
                  <button
                    key={gradient}
                    type="button"
                    className="h-12 rounded-md border"
                    style={{ background: gradient }}
                    onClick={() => form.setValue("website_background_gradient", gradient)}
                  />
                ))}
              </div>
            </div>
          )}

          {formData.website_background_style === 'image' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Website Background Image</Label>
                {formData.website_background_image_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveWebsiteBackgroundImage}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Image
                  </Button>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onWebsiteBackgroundImageUpload(file);
                }}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}