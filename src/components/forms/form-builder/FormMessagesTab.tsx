
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";

interface FormMessagesTabProps {
  form: UseFormReturn<any>;
}

export function FormMessagesTab({ form }: FormMessagesTabProps) {
  const { t } = useTranslation("forms");
  const formTitle = form.watch("title");

  const previewMessage = (message: string) => {
    return message?.replace("{title}", formTitle || "Your Form");
  };

  return (
    <div className="space-y-6 overflow-y-auto px-1 h-full">
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="welcome_message_template.en"
          defaultValue="Thank you for submitting the form \"{title}\". We have received your response and will be in touch soon."
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("messages.welcome.en.label")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("messages.welcome.en.placeholder")}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground mb-2">{t("messages.welcome.preview")} (EN):</p>
          <p className="text-sm">{previewMessage(form.watch("welcome_message_template.en"))}</p>
        </Card>

        <FormField
          control={form.control}
          name="welcome_message_template.fr"
          defaultValue="Merci d'avoir soumis le formulaire \"{title}\". Nous avons bien reçu votre réponse et nous vous contacterons bientôt."
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("messages.welcome.fr.label")}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t("messages.welcome.fr.placeholder")}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground mb-2">{t("messages.welcome.preview")} (FR):</p>
          <p className="text-sm">{previewMessage(form.watch("welcome_message_template.fr"))}</p>
        </Card>

        <div className="text-sm text-muted-foreground">
          <p>{t("messages.welcome.help")}</p>
          <p className="mt-1">{t("messages.welcome.placeholder_hint")}</p>
        </div>
      </div>
    </div>
  );
}
