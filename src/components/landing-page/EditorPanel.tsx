import { Button } from "@/components/ui/button";
import { TemplateSelector } from "./TemplateSelector";
import { BrandSettings } from "./BrandSettings";
import { ContentEditor } from "./ContentEditor";

interface EditorPanelProps {
  selectedTemplate: string;
  primaryColor: string;
  selectedFont: string;
  businessName: string;
  description: string;
  welcomeMessage: string;
  onTemplateChange: (template: string) => void;
  onColorChange: (color: string) => void;
  onFontChange: (font: string) => void;
  onBusinessNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
  onWelcomeMessageChange: (msg: string) => void;
  onImageUpload: (file: File) => void;
}

export function EditorPanel({
  selectedTemplate,
  primaryColor,
  selectedFont,
  businessName,
  description,
  welcomeMessage,
  onTemplateChange,
  onColorChange,
  onFontChange,
  onBusinessNameChange,
  onDescriptionChange,
  onWelcomeMessageChange,
  onImageUpload,
}: EditorPanelProps) {
  return (
    <div className="space-y-6 bg-card p-6 rounded-lg">
      <h2 className="text-2xl font-bold">Page Editor</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Choose Template</h3>
          <TemplateSelector
            value={selectedTemplate}
            onChange={onTemplateChange}
          />
        </div>

        <BrandSettings
          primaryColor={primaryColor}
          selectedFont={selectedFont}
          onColorChange={onColorChange}
          onFontChange={onFontChange}
        />

        <ContentEditor
          businessName={businessName}
          description={description}
          welcomeMessage={welcomeMessage}
          onBusinessNameChange={onBusinessNameChange}
          onDescriptionChange={onDescriptionChange}
          onWelcomeMessageChange={onWelcomeMessageChange}
          onImageUpload={onImageUpload}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline">Preview</Button>
        <Button>Publish</Button>
      </div>
    </div>
  );
}