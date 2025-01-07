import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface FormFieldRendererProps {
  field: {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
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
        <div className="relative w-full">
          <PhoneInput
            country={'us'}
            value={value || ''}
            onChange={(phone) => onChange(phone)}
            inputStyle={{
              ...commonInputStyles,
              width: '100%',
              height: '40px',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '1px solid #333333',
              paddingLeft: '48px', // Adjusted to accommodate the flag
            }}
            buttonStyle={{
              backgroundColor: '#000000',
              borderColor: '#333333',
              borderRight: '1px solid #333333',
            }}
            dropdownStyle={{
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '1px solid #333333',
            }}
            containerStyle={{
              width: '100%',
            }}
            searchStyle={{
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '1px solid #333333',
            }}
            inputProps={{
              required: field.required,
              placeholder: field.placeholder,
            }}
          />
        </div>
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