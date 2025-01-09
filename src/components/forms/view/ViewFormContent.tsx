import { Button } from "@/components/ui/button";
import { FormFieldRenderer } from "../FormFieldRenderer";
import { FormField } from "@/types/form";

interface ViewFormContentProps {
  form: {
    title: string;
    description?: string;
    fields: FormField[];
    logo_url?: string;
    primary_color?: string;
    input_background_color?: string;
    show_border?: boolean;
    font_family?: string;
  };
  formData: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
}

export function ViewFormContent({ form, formData, onFieldChange, onSubmit, submitting }: ViewFormContentProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8 relative z-10">
      {form.logo_url && (
        <div className="flex justify-center mb-6">
          <img 
            src={form.logo_url} 
            alt="Form logo" 
            className="max-h-20 object-contain"
          />
        </div>
      )}
      <div>
        <h1 
          className="text-2xl font-bold mb-2"
          style={{ color: form.primary_color }}
        >
          {form.title}
        </h1>
        {form.description && (
          <p className="text-muted-foreground">{form.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {form.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <FormFieldRenderer
              field={field}
              value={formData[field.label]}
              onChange={(value) => onFieldChange(field.label, value)}
              customization={{
                primaryColor: form.primary_color,
                fontFamily: form.font_family,
              }}
            />
          </div>
        ))}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={submitting}
        style={{
          backgroundColor: form.primary_color,
          borderColor: form.primary_color,
        }}
      >
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}