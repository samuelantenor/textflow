import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";
import { CampaignNameField } from "./form-fields/CampaignNameField";
import { GroupSelectField } from "./form-fields/GroupSelectField";
import { MessageField } from "./form-fields/MessageField";
import { MediaField } from "./form-fields/MediaField";
import { ScheduleField } from "./form-fields/ScheduleField";
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface CampaignFormFieldsProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignFormFields({ form }: CampaignFormFieldsProps) {
  return (
    <div className="space-y-4">
      <TabsContent value="details" className="m-0">
        <Card className="p-6">
          <div className="grid gap-6">
            <CampaignNameField form={form} />
            <GroupSelectField form={form} />
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="message" className="m-0">
        <Card className="p-6">
          <div className="grid gap-6">
            <MessageField form={form} />
            <MediaField form={form} />
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="schedule" className="m-0">
        <Card className="p-6">
          <ScheduleField form={form} />
        </Card>
      </TabsContent>
    </div>
  );
}