import { FormField } from "@/types/form";
import { FormFieldRenderer } from "@/components/forms/FormFieldRenderer";
import { Label } from "@/components/ui/label";

interface FormFieldsProps {
  fields: FormField[];
  formData: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  customization?: {
    primaryColor?: string;
  };
}

export function FormFields({ fields, formData, onFieldChange, customization }: FormFieldsProps) {
  return (
    <div className="space-y-6">
      {fields.map((field: FormField) => (
        <div key={`field-${field.id}-${field.label}`} className="space-y-2">
          {field.type !== 'checkbox' && (
            <Label 
              htmlFor={field.id}
              style={{ color: customization?.primaryColor }}
            >
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          )}
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          <FormFieldRenderer
            field={field}
            value={formData[field.label]}
            onChange={(value) => onFieldChange(field.label, value)}
            customization={customization}
          />
        </div>
      ))}
    </div>
  );
}