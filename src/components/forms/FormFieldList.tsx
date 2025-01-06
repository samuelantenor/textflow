import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface FormFieldListProps {
  form: UseFormReturn<any>;
}

export function FormFieldList({ form }: FormFieldListProps) {
  const fields = form.watch('fields') || [];

  const removeField = (index: number) => {
    const currentFields = form.getValues('fields');
    form.setValue('fields', currentFields.filter((_, i) => i !== index));
  };

  if (!fields.length) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No fields added yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {fields.map((field: any, index: number) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div>
            <p className="font-medium">{field.label}</p>
            <p className="text-sm text-muted-foreground">
              Type: {field.type}
              {field.required && " • Required"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeField(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}