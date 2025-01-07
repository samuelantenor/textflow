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
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <CampaignNameField form={form} />
        <GroupSelectField form={form} />
      </div>
      <PhoneNumberField form={form} />
      <MessageField form={form} />
      <MediaField form={form} />
      <ScheduleField form={form} />
    </div>
  );
}