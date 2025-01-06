import { FormField } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormFieldsProps {
  fields: FormField[];
  formData: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  primaryColor?: string;
}

export function FormFields({ fields, formData, onFieldChange, primaryColor }: FormFieldsProps) {
  const renderField = (field: FormField) => {
    const commonLabelStyles = {
      color: primaryColor,
      marginBottom: '0.5rem',
      display: 'block',
      fontWeight: 500
    };

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.label} className="space-y-2">
            <Label style={commonLabelStyles}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
            )}
            <Textarea
              placeholder={field.placeholder}
              value={formData[field.label] || ''}
              onChange={(e) => onFieldChange(field.label, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case 'radio':
        return (
          <div key={field.label} className="space-y-2">
            <Label style={commonLabelStyles}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
            )}
            <RadioGroup
              value={formData[field.label] || ''}
              onValueChange={(value) => onFieldChange(field.label, value)}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.label}-${option}`} />
                  <Label htmlFor={`${field.label}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.label} className="flex items-center space-x-2">
            <Checkbox
              id={field.label}
              checked={formData[field.label] || false}
              onCheckedChange={(checked) => onFieldChange(field.label, checked)}
            />
            <Label htmlFor={field.label} style={commonLabelStyles}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'select':
        return (
          <div key={field.label} className="space-y-2">
            <Label style={commonLabelStyles}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
            )}
            <Select
              value={formData[field.label] || ''}
              onValueChange={(value) => onFieldChange(field.label, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return (
          <div key={field.label} className="space-y-2">
            <Label style={commonLabelStyles}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
            )}
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.label] || ''}
              onChange={(e) => onFieldChange(field.label, e.target.value)}
              required={field.required}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {fields.map(renderField)}
    </div>
  );
}