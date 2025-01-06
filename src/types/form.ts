export interface FormField {
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: string[];
}

export interface FormData {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
}