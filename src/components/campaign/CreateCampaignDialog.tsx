import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2 } from "lucide-react";
import { CampaignFormFields } from "./CampaignFormFields";
import type { CampaignFormData } from "@/types/campaign";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const campaignFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  message: z.string().min(1, "Message is required"),
  scheduled_for: z.date().optional(),
  scheduled_time: z.string().optional(),
  group_id: z.string().min(1, "Group is required"),
  from_number: z.string().optional(),
});

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation(['campaigns']);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      message: "",
      group_id: "",
      scheduled_for: undefined,
      scheduled_time: undefined,
      from_number: undefined,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error(t('errors.auth'));
      }

      // Calculate scheduled_at by combining date and time
      let scheduled_at = null;
      let status = 'draft';
      if (data.scheduled_for && data.scheduled_time) {
        const [hours, minutes] = data.scheduled_time.split(':');
        const scheduledDate = new Date(data.scheduled_for);
        scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        scheduled_at = scheduledDate.toISOString();
        status = 'scheduled';
      }

      const { error } = await supabase.from("campaigns").insert({
        user_id: session.user.id,
        name: data.name,
        message: data.message,
        scheduled_at,
        status,
        group_id: data.group_id,
        from_number: data.from_number,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      if (error) throw error;

      toast({
        title: status === 'scheduled' ? t('success.scheduled.title') : t('success.created.title'),
        description: status === 'scheduled' ? t('create.scheduledDescription') : t('create.savedAsDraft'),
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: t('errors.create'),
        description: error instanceof Error ? error.message : t('errors.create'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-500 hover:bg-primary-600">
          <Plus className="w-4 h-4 mr-2" />
          {t('create.newCampaign')}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-2xl h-[95vh] md:h-auto md:max-h-[85vh] p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <DialogTitle className="text-xl">{t('create.title')}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="px-4 sm:px-6 flex-1 h-[calc(95vh-8rem)] md:h-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CampaignFormFields form={form} showAllFields={true} />
            </form>
          </Form>
        </ScrollArea>

        <div className="mt-6 border-t border-gray-800/50">
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto order-1 sm:order-none"
              >
                {t('buttons.cancel')}
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600"
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('create.createCampaign')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
