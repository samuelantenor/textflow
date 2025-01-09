import { Button } from "@/components/ui/button";
import { FormFields } from "../FormFields";

interface ViewFormContentProps {
  form: any;
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

      <FormFields
        fields={form.fields}
        formData={formData}
        onFieldChange={onFieldChange}
        customization={{
          primaryColor: form.primary_color,
          inputBackgroundColor: form.input_background_color,
          showBorder: form.show_border,
        }}
      />

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