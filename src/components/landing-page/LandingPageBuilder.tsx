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
        <EditorPanel
          selectedTemplate={selectedTemplate}
          primaryColor={primaryColor}
          selectedFont={selectedFont}
          businessName={businessName}
          description={description}
          welcomeMessage={welcomeMessage}
          onTemplateChange={setSelectedTemplate}
          onColorChange={setPrimaryColor}
          onFontChange={setSelectedFont}
          onBusinessNameChange={setBusinessName}
          onDescriptionChange={setDescription}
          onWelcomeMessageChange={setWelcomeMessage}
          onImageUpload={handleImageUpload}
        />
        <PreviewPanel />
      </div>
    </div>
  );
}