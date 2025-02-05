import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const formSchema = z.object({
  email: z.string().email(),
});

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const { t } = useTranslation(['auth']);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: t('auth:forgotPassword.errors.emailNotFound'),
          description: error.message,
        });
        return;
      }

      toast({
        title: t('auth:forgotPassword.success'),
        description: t('auth:forgotPassword.successDescription'),
      });
      onBack();
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: t('auth:forgotPassword.errors.generic'),
        description: t('auth:forgotPassword.errors.tryAgain'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">
          {t('auth:forgotPassword.title')}
        </h2>
        <p className="text-sm text-gray-400">
          {t('auth:forgotPassword.subtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth:forgotPassword.emailLabel')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('auth:forgotPassword.emailPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('auth:loading.sending') : t('auth:forgotPassword.sendButton')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('auth:forgotPassword.backToLogin')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;