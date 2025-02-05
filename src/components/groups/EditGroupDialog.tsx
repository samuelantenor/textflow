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

interface EditGroupDialogProps {
  group: {
    id: string;
    name: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGroupDialog({ group, open, onOpenChange }: EditGroupDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['groups']);
  const form = useForm({
    defaultValues: {
      name: group.name,
    },
  });

  const onSubmit = async (values: { name: string }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('campaign_groups')
        .update({ name: values.name })
        .eq('id', group.id);

      if (error) throw error;

      toast({
        title: t('edit.success'),
        description: t('edit.success'),
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-groups'] });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('edit.error'),
        description: error instanceof Error ? error.message : t('edit.error'),
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
          <DialogTitle>{t('edit.title')}</DialogTitle>
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
                    <Input {...field} placeholder={t('form.name.placeholder')} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('edit.saving') : t('edit.saveChanges')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}