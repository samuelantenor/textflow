import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export interface FormFieldRendererProps {
  field: {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    description?: string;
    options?: Array<{
      label: string;
      value: string;
    }>;
  };
  value: any;
  onChange: (value: any) => void;
  customization?: {
    primaryColor?: string;
    fontFamily?: string;
  };
}

export const FormFieldRenderer = ({ field, value, onChange, customization }: FormFieldRendererProps) => {
  const commonInputStyles = {
    fontFamily: customization?.fontFamily || 'Inter',
    borderColor: customization?.primaryColor,
  };

  switch (field.type) {
    case 'phone':
      return (
        <PhoneInput
          country={'us'}
          value={value || ''}
          onChange={(phone) => onChange(phone)}
          enableSearch={true}
          searchPlaceholder="Search countries..."
          inputStyle={{
            ...commonInputStyles,
            width: '100%',
            height: '40px',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: '1px solid #333333',
          }}
          buttonStyle={{
            backgroundColor: '#000000',
            borderColor: '#333333',
            borderRight: '1px solid #333333',
          }}
          containerStyle={{
            width: '100%',
          }}
          dropdownStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            border: '1px solid #333333',
          }}
          searchStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            border: '1px solid #333333',
            margin: '0',
            width: '100%',
            height: '30px',
          }}
          inputProps={{
            required: field.required,
            placeholder: field.placeholder,
          }}
        />
      );
    case 'textarea':
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          style={commonInputStyles}
        />
      );
    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.id}
            checked={value || false}
            onCheckedChange={onChange}
          />
          <Label htmlFor={field.id}>{field.label}</Label>
        </div>
      );
    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger style={commonInputStyles}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return (
        <Input
          type={field.type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          style={commonInputStyles}
        />
      );
  }
};