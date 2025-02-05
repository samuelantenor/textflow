import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormPreview } from "../FormPreview";
import { FormFieldBuilder } from "../FormFieldBuilder";
import { FormFieldList } from "../FormFieldList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface FormFieldsTabProps {
  form: UseFormReturn<any>;
}

export function FormFieldsTab({ form }: FormFieldsTabProps) {
  const { t } = useTranslation("forms");
  const formData = form.watch();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      <ScrollArea className="h-[calc(90vh-220px)]">
        <div className="space-y-4 pr-4">
          <div className="space-y-4 bg-muted/50 rounded-lg p-4">
            <Input
              placeholder={t("builder.form.title.placeholder")}
              className="text-xl font-semibold bg-background"
              {...form.register("title", { required: true })}
            />
            <Textarea
              placeholder={t("builder.form.description.placeholder")}
              className="bg-background"
              {...form.register("description")}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("builder.form.group.label")}</label>
              <Select
                value={form.watch("group_id")}
                onValueChange={(value) => form.setValue("group_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("builder.form.group.placeholder")} />
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
            backgroundImageUrl: formData.background_image_url,
            backgroundImageStyle: formData.background_image_style,
            backgroundOpacity: formData.background_opacity,
            inputBackgroundColor: formData.input_background_color,
            showBorder: formData.show_border,
          }}
        />
      </ScrollArea>
    </div>
  );
}