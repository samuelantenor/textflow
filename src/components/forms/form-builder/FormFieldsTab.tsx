import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormPreview } from "../FormPreview";
import { FormFieldBuilder } from "../FormFieldBuilder";
import { FormFieldList } from "../FormFieldList";

interface FormFieldsTabProps {
  form: UseFormReturn<any>;
  groups?: Array<{ id: string; name: string }>;
}

export function FormFieldsTab({ form, groups }: FormFieldsTabProps) {
  const formData = form.watch();

  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      <ScrollArea className="h-[calc(90vh-220px)]">
        <div className="space-y-4 pr-4">
          <div className="space-y-4 bg-muted/50 rounded-lg p-4">
            <Input
              placeholder="Enter form title"
              className="text-xl font-semibold bg-background"
              {...form.register("title", { required: true })}
            />
            <Textarea
              placeholder="Describe your form (optional)"
              className="bg-background"
              {...form.register("description")}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Contact Group</label>
              <Select
                value={form.watch("group_id")}
                onValueChange={(value) => form.setValue("group_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <FormFieldBuilder form={form} />
          <FormFieldList form={form} />
        </div>
      </ScrollArea>
      <ScrollArea className="h-[calc(90vh-220px)]">
        <FormPreview
          title={formData.title}
          description={formData.description}
          fields={formData.fields}
          customization={{
            backgroundColor: formData.background_color,
            fontFamily: formData.font_family,
            logoUrl: formData.logo_url,
            primaryColor: formData.primary_color,
          }}
        />
      </ScrollArea>
    </div>
  );
}