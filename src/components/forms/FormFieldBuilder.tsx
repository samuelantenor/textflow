import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";

interface FormFieldBuilderProps {
  form: UseFormReturn<any>;
}

export function FormFieldBuilder({ form }: FormFieldBuilderProps) {
  const [fieldType, setFieldType] = useState<string>('text');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldDescription, setFieldDescription] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState('');

  const addField = () => {
    if (!fieldLabel) return;

    const currentFields = form.getValues('fields') || [];
    const newField: any = {
      type: fieldType,
      label: fieldLabel,
      required: isRequired,
      description: fieldDescription || undefined,
      placeholder: placeholder || undefined,
    };

    if (['radio', 'select'].includes(fieldType) && options) {
      newField.options = options.split('\n').filter(Boolean);
    }

    form.setValue('fields', [...currentFields, newField]);

    // Reset form
    setFieldLabel('');
    setFieldDescription('');
    setPlaceholder('');
    setFieldType('text');
    setIsRequired(false);
    setOptions('');
  };

  return (
    <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
      <h3 className="font-semibold">Add New Field</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Field Type</Label>
          <Select value={fieldType} onValueChange={setFieldType}>
            <SelectTrigger>
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Long Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="radio">Multiple Choice</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Field Label</Label>
          <Input
            value={fieldLabel}
            onChange={(e) => setFieldLabel(e.target.value)}
            placeholder="Enter question or label"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Input
          value={fieldDescription}
          onChange={(e) => setFieldDescription(e.target.value)}
          placeholder="Add helper text to explain this field"
        />
      </div>
      <div className="space-y-2">
        <Label>Placeholder (optional)</Label>
        <Input
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
          placeholder="Enter placeholder text"
        />
      </div>
      {['radio', 'select'].includes(fieldType) && (
        <div className="space-y-2">
          <Label>Options (one per line)</Label>
          <Textarea
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="Enter options, one per line"
            rows={4}
          />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Switch
          checked={isRequired}
          onCheckedChange={setIsRequired}
          id="required"
        />
        <Label htmlFor="required">Required field</Label>
      </div>
      <Button
        type="button"
        onClick={addField}
        disabled={!fieldLabel}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Field
      </Button>
    </div>
  );
}