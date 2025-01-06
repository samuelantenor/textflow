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
  const [isRequired, setIsRequired] = useState(false);

  const addField = () => {
    if (!fieldLabel) return;

    const currentFields = form.getValues('fields') || [];
    form.setValue('fields', [
      ...currentFields,
      {
        type: fieldType,
        label: fieldLabel,
        required: isRequired,
      },
    ]);

    // Reset form
    setFieldLabel('');
    setFieldType('text');
    setIsRequired(false);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Field Type</Label>
          <Select value={fieldType} onValueChange={setFieldType}>
            <SelectTrigger>
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Field Label</Label>
          <Input
            value={fieldLabel}
            onChange={(e) => setFieldLabel(e.target.value)}
            placeholder="Enter field label"
          />
        </div>
      </div>
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