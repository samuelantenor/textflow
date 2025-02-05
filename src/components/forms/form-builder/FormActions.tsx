import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
}

export function FormActions({ isLoading, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-background p-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        <Save className="w-4 h-4 mr-2" />
        Save Form
      </Button>
    </div>
  );
}