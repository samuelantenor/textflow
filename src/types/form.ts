export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;  // Changed from optional to required
  placeholder?: string;
  description?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
}