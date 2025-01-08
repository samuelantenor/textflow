import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { FormFieldsTab } from "./FormFieldsTab";
import { FormDesignTab } from "./FormDesignTab";

export interface FormTabsProps {
  form: UseFormReturn<any>;
  activeTab: string;
  onTabChange: (value: string) => void;
  formId?: string;
  handleLogoUpload: (file: File) => Promise<void>;
}

export function FormTabs({ form, activeTab, onTabChange, formId, handleLogoUpload }: FormTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
      <TabsList className="mb-4">
        <TabsTrigger value="fields">Form Fields</TabsTrigger>
        <TabsTrigger value="design">Design</TabsTrigger>
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