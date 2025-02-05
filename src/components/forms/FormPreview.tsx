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
    backgroundImageUrl?: string;
    backgroundImageStyle?: 'cover' | 'contain' | 'repeat';
    backgroundOpacity?: number;
    inputBackgroundColor?: string;
    showBorder?: boolean;
  };
}

export function FormPreview({ title, description, fields, customization }: FormPreviewProps) {
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: customization?.backgroundColor || '#FFFFFF',
    fontFamily: customization?.fontFamily || 'Inter',
    position: 'relative',
  };

  if (customization?.backgroundImageUrl) {
    Object.assign(backgroundStyle, {
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
      <Card 
        className="p-6 bg-card/50 backdrop-blur-sm h-[calc(100%-2rem)] overflow-y-auto relative"
        style={backgroundStyle}
      >
        {customization?.backgroundImageUrl && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundColor: customization.backgroundColor,
              opacity: (customization.backgroundOpacity || 100) / 100,
            }}
          />
        )}
        <FormPreviewContent
          title={title}
          description={description}
          fields={fields}
          customization={customization}
        />
      </Card>
    </div>
  );
}