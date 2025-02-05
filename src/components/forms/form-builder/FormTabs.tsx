import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { FormFieldsTab } from "./FormFieldsTab";
import { FormDesignTab } from "./FormDesignTab";
import { useTranslation } from "react-i18next";

export interface FormTabsProps {
  form: UseFormReturn<any>;
  activeTab: string;
  onTabChange: (value: string) => void;
  formId?: string;
  handleLogoUpload: (file: File) => Promise<void>;
}

export function FormTabs({ form, activeTab, onTabChange, formId, handleLogoUpload }: FormTabsProps) {
  const { t } = useTranslation("forms");

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
      <TabsList className="mb-4">
        <TabsTrigger value="fields">{t("builder.tabs.fields")}</TabsTrigger>
        <TabsTrigger value="design">{t("builder.tabs.design")}</TabsTrigger>
      </TabsList>

      <TabsContent value="fields" className="flex-1 overflow-hidden">
        <FormFieldsTab form={form} />
      </TabsContent>

      <TabsContent value="design" className="flex-1 overflow-hidden">
        <FormDesignTab form={form} handleLogoUpload={handleLogoUpload} formId={formId} />
      </TabsContent>
    </Tabs>
  );
}