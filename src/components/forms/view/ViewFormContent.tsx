import { Button } from "@/components/ui/button";
import { FormFields } from "./FormFields";
import { FormField } from "@/types/form";

interface ViewFormContentProps {
  form: {
    title: string;
    description?: string;
    fields: FormField[];
    logo_url?: string;
    primary_color?: string;
    font_family?: string;
    input_background_color?: string;
    show_border?: boolean;
    submit_button_color?: string;
  };
  formData: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
}

export function ViewFormContent({ form, formData, onFieldChange, onSubmit, submitting }: ViewFormContentProps) {
  // Calculate contrast color for button text
  const getContrastColor = (hexcolor: string) => {
    // Remove the # if present
    const hex = hexcolor.replace('#', '');
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const buttonTextColor = form.submit_button_color ? 
    getContrastColor(form.submit_button_color) : '#FFFFFF';

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
          fontFamily: form.font_family,
          inputBackgroundColor: form.input_background_color,
          showBorder: form.show_border,
          inputTextColor: form.primary_color,
        }}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={submitting}
        style={{
          backgroundColor: form.submit_button_color,
          borderColor: form.submit_button_color,
          color: buttonTextColor,
        }}
      >
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}