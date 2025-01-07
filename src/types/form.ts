export interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{
    label: string;
    value: string;
  }>;
}