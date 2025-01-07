import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { TestMessageFormFields } from "./TestMessageFormFields";
import type { SendTestMessageFormData } from "./types";

interface TestMessageFormProps {
  isLoading: boolean;
  onSubmit: (data: SendTestMessageFormData) => Promise<void>;
  onCancel: () => void;
}

export function TestMessageForm({ isLoading, onSubmit, onCancel }: TestMessageFormProps) {
  const form = useForm<SendTestMessageFormData>();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TestMessageFormFields form={form} />
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send Test
          </Button>
        </div>
      </form>
    </Form>
  );
}