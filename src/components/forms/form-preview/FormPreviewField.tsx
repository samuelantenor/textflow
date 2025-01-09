import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormPreviewFieldProps {
  field: {
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    description?: string;
  };
  customization?: {
    primaryColor?: string;
    inputBackgroundColor?: string;
    showBorder?: boolean;
  };
}

export function FormPreviewField({ field, customization }: FormPreviewFieldProps) {
  const commonInputStyles = {
    backgroundColor: customization?.inputBackgroundColor || '#FFFFFF',
    borderColor: customization?.showBorder ? customization?.primaryColor : 'transparent',
    borderWidth: customization?.showBorder ? '1px' : '0',
    borderRadius: '0.375rem',
  };

  const renderField = () => {
    switch (field.type) {
      case 'textarea':
        return <Textarea {...commonInputStyles} placeholder={field.placeholder} />;
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`field-${field.label}`}
              className={cn(
                "border-2",
                "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              )}
              style={{ 
                borderColor: customization?.primaryColor,
              }}
            />
            <label htmlFor={`field-${field.label}`} className="text-sm">
              {field.label}
            </label>
          </div>
        );
      case 'radio':
        return (
          <RadioGroup>
            {field.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`${field.label}-${optionIndex}`}
                  className={cn(
                    "border-2",
                    "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  )}
                  style={{ 
                    borderColor: customization?.primaryColor,
                  }}
                />
                <Label htmlFor={`${field.label}-${optionIndex}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'select':
        return (
          <Select>
            <SelectTrigger style={commonInputStyles}>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, optionIndex) => (
                <SelectItem key={optionIndex} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            type={field.type === 'number' || field.type === 'date' ? field.type : 'text'}
            placeholder={field.placeholder}
            style={commonInputStyles}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <Label
          style={{ color: customization?.primaryColor }}
        >
          {field.label}
          {field.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </Label>
      )}
      {field.description && (
        <p className="text-sm text-muted-foreground mb-2">
          {field.description}
        </p>
      )}
      {renderField()}
    </div>
  );
}