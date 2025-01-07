import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";
import { CampaignNameField } from "./form-fields/CampaignNameField";
import { GroupSelectField } from "./form-fields/GroupSelectField";
import { MessageField } from "./form-fields/MessageField";
import { MediaField } from "./form-fields/MediaField";
import { ScheduleField } from "./form-fields/ScheduleField";
import { PhoneNumberField } from "./form-fields/PhoneNumberField";

interface CampaignFormFieldsProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignFormFields({ form }: CampaignFormFieldsProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Campaign Details</h2>
          <CampaignNameField form={form} />
          <GroupSelectField form={form} />
          <PhoneNumberField form={form} />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Message Content</h2>
          <MessageField form={form} />
          <MediaField form={form} />
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-lg font-semibold mb-6">Schedule</h2>
        <ScheduleField form={form} />
      </div>
    </div>
  );
}