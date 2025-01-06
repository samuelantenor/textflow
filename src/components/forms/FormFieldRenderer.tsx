import { FormField } from "@/types/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormFieldRendererProps {
  field: FormField;
  index: number;
  value: any;
  onChange: (value: any) => void;
}

export function FormFieldRenderer({ field, index, value, onChange }: FormFieldRendererProps) {
  const commonProps = {
    id: `field-${index}`,
    value: value || "",
    onChange: (e: any) => {
      const value = e.target?.value ?? e;
      onChange(value);
    },
    required: field.required,
  };

  switch (field.type) {
    case 'textarea':
      return <Textarea {...commonProps} placeholder={field.placeholder} />;
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`field-${index}`}
            checked={value || false}
            onCheckedChange={(checked) => {
              onChange(checked);
            }}
          />
          <label htmlFor={`field-${index}`} className="text-sm">
            {field.label}
          </label>
        </div>
      );
    case 'radio':
      return (
        <RadioGroup
          value={value || ""}
          onValueChange={(value) => {
            onChange(value);
          }}
        >
          {field.options?.map((option: string, optionIndex: number) => (
            <div key={optionIndex} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${index}-${optionIndex}`} />
              <Label htmlFor={`${index}-${optionIndex}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'select':
      return (
        <Select
          value={value || ""}
          onValueChange={(value) => {
            onChange(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option: string, optionIndex: number) => (
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
          {...commonProps}
          type={field.type === 'number' || field.type === 'date' ? field.type : 'text'}
          placeholder={field.placeholder}
        />
      );
  }
}