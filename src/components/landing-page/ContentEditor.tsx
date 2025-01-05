import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <h3 className="text-lg font-semibold mb-4">Content</h3>
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input
              placeholder="e.g. Wellness Spa & Therapy"
              value={businessName}
              onChange={(e) => onBusinessNameChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Welcome Message</Label>
            <Input
              placeholder="e.g. Book Your Next Appointment Online"
              value={welcomeMessage}
              onChange={(e) => onWelcomeMessageChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Business Description</Label>
            <Textarea
              placeholder="Tell your clients about your services..."
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <div className="space-y-2">
            <Label>Logo or Business Image</Label>
            <FileUpload
              onFileSelect={onImageUpload}
              accept="image/*"
            />
            <p className="text-sm text-muted-foreground">
              Recommended size: 800x600px. Max file size: 5MB
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}