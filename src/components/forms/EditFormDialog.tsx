import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormTabs } from "./form-builder/FormTabs";
import { FormActions } from "./form-builder/FormActions";
import { useFormEditor } from "@/hooks/forms/useFormEditor";

interface EditFormDialogProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    fields: any[];
    group_id: string;
    background_color?: string;
    font_family?: string;
    logo_url?: string;
    primary_color?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditFormDialog({ form: initialForm, open, onOpenChange }: EditFormDialogProps) {
  const {
    form,
    isLoading,
    activeTab,
    setActiveTab,
    handleLogoUpload,
    onSubmit,
  } = useFormEditor({
    initialForm,
    onClose: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Form: {initialForm.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden">
            <FormTabs
              form={form}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleLogoUpload={handleLogoUpload}
              formId={initialForm.id}
            />
            <FormActions
              isLoading={isLoading}
              onCancel={() => onOpenChange(false)}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}