import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Paintbrush, Image as ImageIcon, Type } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";
import { ColorPicker } from "./ColorPicker";
import { FontSelector } from "./FontSelector";

export function LandingPageBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#9b87f5");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("landing_page_assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="space-y-6 bg-card p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Page Editor</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose Template</h3>
              <TemplateSelector
                value={selectedTemplate}
                onChange={setSelectedTemplate}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Brand Settings</h3>
              <div className="space-y-3">
                <ColorPicker
                  value={primaryColor}
                  onChange={setPrimaryColor}
                  label="Primary Color"
                />
                <FontSelector
                  value={selectedFont}
                  onChange={setSelectedFont}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Content</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
                <Textarea
                  placeholder="Business Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Textarea
                  placeholder="Welcome Message"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Images
                  </label>
                  <FileUpload
                    onFileSelect={handleImageUpload}
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline">Preview</Button>
            <Button>Publish</Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-card p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          <div className="aspect-[9/16] bg-background rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
            <span className="text-muted-foreground">Preview will appear here</span>
          </div>
        </div>
      </div>
    </div>
  );
}