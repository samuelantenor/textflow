
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "@/types/campaign";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GroupSelectField } from "./form-fields/GroupSelectField";
import { PhoneNumberField } from "./form-fields/PhoneNumberField";
import { ScheduleField } from "./form-fields/ScheduleField";
import { useTranslation } from "react-i18next";

interface CampaignFormFieldsProps {
  form: UseFormReturn<CampaignFormData>;
  showAllFields?: boolean;
}

export function CampaignFormFields({ form, showAllFields = false }: CampaignFormFieldsProps) {
  const { t } = useTranslation(['campaigns']);
  const message = form.watch("message") || "";

  return (
    <div className="grid gap-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-200">
              {t('form.name.label')}
            </FormLabel>
            <FormControl>
              <Input 
                placeholder={t('form.name.placeholder')}
                className="bg-black/30 border-gray-800 focus:border-primary-500/50"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-200">
              {t('form.message.label')}
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder={t('form.message.placeholder')}
                className="min-h-[120px] bg-black/30 border-gray-800 focus:border-primary-500/50"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showAllFields && (
        <>
          <GroupSelectField form={form} />
          <PhoneNumberField form={form} />
          <ScheduleField form={form} />
        </>
      )}
    </div>
  );
}
