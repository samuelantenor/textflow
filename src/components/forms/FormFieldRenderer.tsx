import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldRendererProps {
  field: {
    type: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    description?: string;
  };
  index: number;
  value: any;
  onChange: (value: any) => void;
  customization?: {
    primaryColor?: string;
  };
}

export function FormFieldRenderer({ field, index, value, onChange, customization }: FormFieldRendererProps) {
  const commonInputStyles = {
    borderColor: customization?.primaryColor,
    borderRadius: '0.375rem',
  };

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          id={`field-${index}`}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          style={commonInputStyles}
        />
      );
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`field-${index}`}
            checked={value || false}
            onCheckedChange={onChange}
            required={field.required}
            className={cn(
              "border-2",
              "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            )}
            style={{ 
              borderColor: customization?.primaryColor,
            }}
          />
          <label 
            htmlFor={`field-${index}`}
            className="text-sm"
            style={{ color: customization?.primaryColor }}
          >
            {field.label}
          </label>
        </div>
      );
    case 'radio':
      return (
        <RadioGroup
          value={value || ''}
          onValueChange={onChange}
          required={field.required}
        >
          {field.options?.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option}
                id={`${index}-${optionIndex}`}
                className={cn(
                  "border-2",
                  "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                )}
                style={{ 
                  borderColor: customization?.primaryColor,
                }}
              />
              <Label 
                htmlFor={`${index}-${optionIndex}`}
                style={{ color: customization?.primaryColor }}
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'select':
      return (
        <Select
          value={value || ''}
          onValueChange={onChange}
          required={field.required}
        >
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
          id={`field-${index}`}
          type={field.type === 'number' || field.type === 'date' ? field.type : 'text'}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          style={commonInputStyles}
        />
      );
  }
}