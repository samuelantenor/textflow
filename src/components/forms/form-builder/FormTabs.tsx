import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormFieldsTab } from "./FormFieldsTab";
import { FormDesignTab } from "./FormDesignTab";
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";

interface FormTabsProps {
  form: UseFormReturn<any>;
  activeTab: string;
  setActiveTab: (value: string) => void;
  handleLogoUpload: (file: File) => Promise<void>;
  formId: string;
}

export function FormTabs({ 
  form, 
  activeTab, 
  setActiveTab, 
  handleLogoUpload,
  formId 
}: FormTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="mb-4">
        <TabsTrigger value="fields">Form Fields</TabsTrigger>
        <TabsTrigger value="design">Design</TabsTrigger>
      </TabsList>

      <TabsContent value="fields" className="flex-1 overflow-hidden">
        <FormFieldsTab form={form} />
      </TabsContent>

      <TabsContent value="design" className="flex-1 overflow-hidden">
        <FormDesignTab 
          form={form} 
          handleLogoUpload={handleLogoUpload} 
          formId={formId} 
        />
      </TabsContent>
    </Tabs>
  );
}