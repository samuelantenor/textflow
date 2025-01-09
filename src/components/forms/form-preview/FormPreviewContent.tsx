import { Label } from "@/components/ui/label";
import { FormPreviewField } from "./FormPreviewField";

interface FormPreviewContentProps {
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

export function FormPreviewContent({ title, description, fields, customization }: FormPreviewContentProps) {
  return (
    <div className="space-y-6 relative z-10">
      {customization?.logoUrl && (
        <div className="flex justify-center mb-6">
          <img 
            src={customization.logoUrl} 
            alt="Form logo" 
            className="max-h-20 object-contain"
          />
        </div>
      )}
      <div>
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: customization?.primaryColor }}
        >
          {title || "Untitled Form"}
        </h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-8">
        {fields.map((field, index) => (
          <FormPreviewField
            key={index}
            field={field}
            customization={customization}
          />
        ))}
      </div>
    </div>
  );
}