import { Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  };
}

export function FormPreview({ title, description, fields, customization }: FormPreviewProps) {
  const renderField = (field: FormPreviewProps['fields'][0], index: number) => {
    const commonProps = {
      id: `field-${index}`,
      placeholder: field.placeholder,
      className: cn(
        "transition-all duration-200",
        "focus:ring-2 focus:ring-offset-2",
        "hover:border-primary/50"
      ),
      style: {
        borderColor: customization?.primaryColor,
        borderRadius: '0.375rem',
      },
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea {...commonProps} className={cn(commonProps.className, "min-h-[100px] resize-y")} />;
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 animate-in">
            <Checkbox 
              id={`field-${index}`}
              className={cn(
                "border-2 transition-all duration-200",
                "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                "hover:border-primary/50"
              )}
              style={{ 
                borderColor: customization?.primaryColor,
              }}
            />
            <label htmlFor={`field-${index}`} className="text-sm">
              {field.label}
            </label>
          </div>
        );
      case 'radio':
        return (
          <RadioGroup className="space-y-2 animate-in">
            {field.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`${index}-${optionIndex}`}
                  className={cn(
                    "border-2 transition-all duration-200",
                    "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                    "hover:border-primary/50"
                  )}
                  style={{ 
                    borderColor: customization?.primaryColor,
                  }}
                />
                <Label htmlFor={`${index}-${optionIndex}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'select':
        return (
          <Select>
            <SelectTrigger 
              className={cn(
                "transition-all duration-200",
                "hover:border-primary/50"
              )}
              style={{ borderColor: customization?.primaryColor }}
            >
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, optionIndex) => (
                <SelectItem 
                  key={optionIndex} 
                  value={option}
                  className="hover:bg-primary/10"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            {...commonProps}
            type={field.type === 'number' || field.type === 'date' ? field.type : 'text'}
            className={cn(commonProps.className, "animate-in")}
          />
        );
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">Form Preview</span>
      </div>
      <Card 
        className={cn(
          "form-preview-card p-6 bg-card/50",
          "transition-all duration-300"
        )}
        style={{
          backgroundColor: customization?.backgroundColor || '#FFFFFF',
          fontFamily: customization?.fontFamily || 'Inter',
        }}
      >
        <div className="space-y-6">
          {customization?.logoUrl && (
            <div className="flex justify-center mb-6 animate-in">
              <img 
                src={customization.logoUrl} 
                alt="Form logo" 
                className="max-h-20 object-contain hover-lift"
              />
            </div>
          )}
          <div className="animate-in">
            <h2 
              className={cn(
                "text-2xl font-bold mb-2",
                "transition-colors duration-200"
              )}
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
              <div key={index} className="space-y-2 animate-in">
                {field.type !== 'checkbox' && (
                  <Label
                    className="transition-colors duration-200"
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
                {renderField(field, index)}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}