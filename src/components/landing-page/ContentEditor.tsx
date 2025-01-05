import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";

interface ContentEditorProps {
  businessName: string;
  description: string;
  welcomeMessage: string;
  onBusinessNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onWelcomeMessageChange: (value: string) => void;
  onImageUpload: (file: File) => void;
}

export function ContentEditor({
  businessName,
  description,
  welcomeMessage,
  onBusinessNameChange,
  onDescriptionChange,
  onWelcomeMessageChange,
  onImageUpload,
}: ContentEditorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Content</h3>
      <div className="space-y-3">
        <Input
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => onBusinessNameChange(e.target.value)}
        />
        <Textarea
          placeholder="Business Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
        <Textarea
          placeholder="Welcome Message"
          value={welcomeMessage}
          onChange={(e) => onWelcomeMessageChange(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Images
          </label>
          <FileUpload
            onFileSelect={onImageUpload}
            accept="image/*"
          />
        </div>
      </div>
    </div>
  );
}