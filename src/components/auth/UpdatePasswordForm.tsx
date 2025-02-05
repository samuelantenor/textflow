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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const UpdatePasswordForm = () => {
  const { t } = useTranslation(['auth']);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: t('auth:updatePassword.errors.generic'),
          description: error.message,
        });
        return;
      }

      toast({
        title: t('auth:updatePassword.success'),
        description: t('auth:updatePassword.successDescription'),
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        variant: "destructive",
        title: t('auth:updatePassword.errors.generic'),
        description: t('auth:updatePassword.errors.tryAgain'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">
          {t('auth:updatePassword.title')}
        </h2>
        <p className="text-sm text-gray-400">
          {t('auth:updatePassword.subtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth:updatePassword.newPasswordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('auth:updatePassword.newPasswordPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth:updatePassword.confirmPasswordLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('auth:updatePassword.confirmPasswordPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('auth:loading.saving') : t('auth:updatePassword.updateButton')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UpdatePasswordForm;