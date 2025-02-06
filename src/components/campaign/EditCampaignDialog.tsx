
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { CampaignFormFields } from "./CampaignFormFields";
import { Campaign, CampaignFormData } from "@/types/campaign";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface EditCampaignDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCampaignDialog({ campaign, open, onOpenChange }: EditCampaignDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation(['campaigns']);
  
  // Convert scheduled_for to Date object if it exists
  const scheduledDate = campaign.scheduled_for ? new Date(campaign.scheduled_for) : undefined;
  
  // Extract time from scheduled_for if it exists
  const scheduledTime = campaign.scheduled_for 
    ? new Date(campaign.scheduled_for).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit'
      })
    : undefined;

  const form = useForm<CampaignFormData>({
    defaultValues: {
      name: campaign.name,
      message: campaign.message,
      group_id: campaign.group_id || '',
      from_number: campaign.from_number,
      scheduled_for: scheduledDate,
      scheduled_time: scheduledTime,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    try {
      setIsLoading(true);

      let mediaUrl = campaign.media_url;
      if (data.media) {
        const fileExt = data.media.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("campaign_media")
          .upload(fileName, data.media);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("campaign_media")
          .getPublicUrl(fileName);
        
        mediaUrl = publicUrl;
      }

      // Combine date and time if both are provided
      let scheduledFor = data.scheduled_for;
      if (scheduledFor && data.scheduled_time) {
        const [hours, minutes] = data.scheduled_time.split(':');
        scheduledFor = new Date(scheduledFor);
        scheduledFor.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      }

      // Determine campaign status
      let status = campaign.status;
      if (scheduledFor) {
        status = 'scheduled';
      }

      // Update campaign in database
      const { error } = await supabase
        .from("campaigns")
        .update({
          name: data.name,
          message: data.message,
          media_url: mediaUrl,
          scheduled_for: scheduledFor?.toISOString(),
          group_id: data.group_id,
          from_number: data.from_number,
          status: status,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          processing_status: scheduledFor ? 'pending' : null
        })
        .eq('id', campaign.id);

      if (error) throw error;

      // If campaign is scheduled, initiate the scheduling process
      if (scheduledFor) {
        const { error: scheduleError } = await supabase.functions.invoke('schedule-campaign-send', {
          body: { campaignId: campaign.id }
        });

        if (scheduleError) {
          throw new Error(`Failed to schedule campaign: ${scheduleError.message}`);
        }

        toast({
          title: t('success.scheduled'),
          description: t('success.scheduledDescription'),
        });
      } else {
        toast({
          title: t('success.updated'),
          description: t('success.updated'),
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast({
        title: t('errors.update'),
        description: error instanceof Error ? error.message : t('errors.update'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-[600px] p-0 gap-0 bg-black/95 border-gray-800">
        <DialogHeader className="px-6 py-4 border-b border-gray-800">
          <DialogTitle className="text-xl font-semibold text-white">
            {t('buttons.edit')}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(85vh-8rem)] px-6 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-200">
                    {t('form.basicInfo')}
                  </h3>
                  <CampaignFormFields form={form} showAllFields={true} />
                </div>
                
                <Separator className="my-6 bg-gray-800" />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-200">
                    {t('form.schedule.label')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Schedule fields are part of CampaignFormFields */}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-gray-800 bg-black/40">
          <div className="flex flex-row-reverse sm:justify-end gap-3">
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-primary-500 hover:bg-primary-600 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('buttons.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none border-gray-700 hover:bg-gray-800"
            >
              {t('buttons.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
