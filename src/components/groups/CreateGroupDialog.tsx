import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['groups']);
  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: { name: string }) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error(t('errors.auth'));
      }

      const { error } = await supabase
        .from('campaign_groups')
        .insert({
          name: values.name,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: t('create.success'),
        description: t('create.success'),
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-groups'] });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: t('create.error'),
        description: error instanceof Error ? error.message : t('create.error'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('create.title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.name.placeholder')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('create.saving') : t('actions.create')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}