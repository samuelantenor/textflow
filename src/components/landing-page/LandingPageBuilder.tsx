import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";

export function LandingPageBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#9b87f5");
  const [secondaryColor, setSecondaryColor] = useState("#7E69AB");
  const [accentColor, setAccentColor] = useState("#6E59A5");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#1A1F2C");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [borderRadius, setBorderRadius] = useState(8);
  const [spacing, setSpacing] = useState(16);
  const { toast } = useToast();

  const handleColorChange = (type: string, color: string) => {
    switch (type) {
      case 'primary':
        setPrimaryColor(color);
        break;
      case 'secondary':
        setSecondaryColor(color);
        break;
      case 'accent':
        setAccentColor(color);
        break;
      case 'background':
        setBackgroundColor(color);
        break;
      case 'text':
        setTextColor(color);
        break;
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // First, check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to upload images");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from("landing_page_assets")
        .upload(fileName, file, {
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("landing_page_assets")
        .getPublicUrl(fileName);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="grid md:grid-cols-2 gap-8">
        <EditorPanel
          selectedTemplate={selectedTemplate}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          backgroundColor={backgroundColor}
          textColor={textColor}
          selectedFont={selectedFont}
          borderRadius={borderRadius}
          spacing={spacing}
          businessName={businessName}
          description={description}
          welcomeMessage={welcomeMessage}
          onTemplateChange={setSelectedTemplate}
          onColorChange={handleColorChange}
          onFontChange={setSelectedFont}
          onBorderRadiusChange={setBorderRadius}
          onSpacingChange={setSpacing}
          onBusinessNameChange={setBusinessName}
          onDescriptionChange={setDescription}
          onWelcomeMessageChange={setWelcomeMessage}
          onImageUpload={handleImageUpload}
        />
        <PreviewPanel
          template={selectedTemplate}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          backgroundColor={backgroundColor}
          textColor={textColor}
          selectedFont={selectedFont}
          borderRadius={borderRadius}
          spacing={spacing}
          businessName={businessName}
          description={description}
          welcomeMessage={welcomeMessage}
        />
      </div>
    </div>
  );
}