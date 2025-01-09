import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormPreviewContent } from "./form-preview/FormPreviewContent";

interface FormPreviewProps {
  title: string;
  description?: string;
  fields: Array<{
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    description?: string;
  }>;
  customization?: {
    backgroundColor?: string;
    fontFamily?: string;
    logoUrl?: string;
    primaryColor?: string;
    submitButtonColor?: string;
    backgroundImageUrl?: string;
    backgroundImageStyle?: 'cover' | 'contain' | 'repeat';
    inputBackgroundColor?: string;
    showBorder?: boolean;
    websiteBackgroundColor?: string;
    websiteBackgroundGradient?: string;
    websiteBackgroundImageUrl?: string;
    websiteBackgroundStyle?: string;
  };
}

export function FormPreview({ title, description, fields, customization }: FormPreviewProps) {
  const websiteBackgroundStyle: React.CSSProperties = {
    backgroundColor: customization?.websiteBackgroundColor || '#FFFFFF',
    backgroundImage: customization?.websiteBackgroundStyle === 'gradient' 
      ? customization.websiteBackgroundGradient
      : customization?.websiteBackgroundStyle === 'image' && customization.websiteBackgroundImageUrl
        ? `url(${customization.websiteBackgroundImageUrl})`
        : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100%',
    padding: '2rem',
  };

  const formBackgroundStyle: React.CSSProperties = {
    backgroundColor: customization?.backgroundColor || '#FFFFFF',
    fontFamily: customization?.fontFamily || 'Inter',
    position: 'relative',
  };

  if (customization?.backgroundImageUrl) {
    Object.assign(formBackgroundStyle, {
      backgroundImage: `url(${customization.backgroundImageUrl})`,
      backgroundSize: customization.backgroundImageStyle === 'repeat' ? 'auto' : customization.backgroundImageStyle,
      backgroundRepeat: customization.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat',
      backgroundPosition: 'center',
    });
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">Form Preview</span>
      </div>
      <div style={websiteBackgroundStyle}>
        <Card 
          className="p-6 bg-card/50 backdrop-blur-sm max-w-2xl mx-auto"
          style={formBackgroundStyle}
        >
          <FormPreviewContent
            title={title}
            description={description}
            fields={fields}
            customization={customization}
          />
        </Card>
      </div>
    </div>
  );
}