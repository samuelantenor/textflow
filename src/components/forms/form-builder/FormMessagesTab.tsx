
import { UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface FormMessagesTabProps {
  form: UseFormReturn<any>;
}

export function FormMessagesTab({ form }: FormMessagesTabProps) {
  const { t } = useTranslation("forms");
  const title = form.watch("title");

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            {t("messages.placeholder.description")}
          </AlertDescription>
        </Alert>

        <FormField
          control={form.control}
          name="welcome_message_template.en"
          defaultValue="Thank you for submitting the form '{title}'. We have received your response and will be in touch soon."
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("messages.english.label")}
              </label>
              <Textarea
                {...field}
                placeholder={t("messages.english.placeholder")}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                {t("messages.preview")}: {field.value.replace("{title}", title)}
              </p>
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="welcome_message_template.fr"
          defaultValue="Merci d'avoir soumis le formulaire '{title}'. Nous avons bien reçu votre réponse et nous vous contacterons bientôt."
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("messages.french.label")}
              </label>
              <Textarea
                {...field}
                placeholder={t("messages.french.placeholder")}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                {t("messages.preview")}: {field.value.replace("{title}", title)}
              </p>
            </div>
          )}
        />
      </div>
    </ScrollArea>
  );
}
