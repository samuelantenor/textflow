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
      <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
        No fields added yet. Start building your form by adding fields above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field: any, index: number) => (
        <div
          key={field.id}
          className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {index + 1}.
              </span>
              <h4 className="font-medium">{field.label}</h4>
              {field.required && (
                <span className="text-xs text-red-500">*</span>
              )}
            </div>
            {field.description && (
              <p className="text-sm text-muted-foreground">
                {field.description}
              </p>
            )}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="capitalize">{field.type}</span>
              {field.placeholder && (
                <>
                  <span>•</span>
                  <span>Placeholder: {field.placeholder}</span>
                </>
              )}
              {field.options && (
                <>
                  <span>•</span>
                  <span>{field.options.length} options</span>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeField(index)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}