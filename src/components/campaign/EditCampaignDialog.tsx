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

interface EditCampaignDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCampaignDialog({ campaign, open, onOpenChange }: EditCampaignDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<CampaignFormData>({
    defaultValues: {
      name: campaign.name,
      message: campaign.message,
      group_id: campaign.group_id || '',
      scheduled_for: campaign.scheduled_for ? new Date(campaign.scheduled_for) : undefined,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    try {
      setIsLoading(true);

      let mediaUrl = campaign.media_url;
      if (data.media) {
        // Delete old media if it exists
        if (campaign.media_url) {
          const oldFileName = campaign.media_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('campaign_media')
              .remove([oldFileName]);
          }
        }

        // Upload new media
        const fileExt = data.media.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('campaign_media')
          .upload(fileName, data.media);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('campaign_media')
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

      const { error } = await supabase
        .from("campaigns")
        .update({
          name: data.name,
          message: data.message,
          media_url: mediaUrl,
          scheduled_for: scheduledFor?.toISOString(),
          group_id: data.group_id,
        })
        .eq('id', campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign updated",
        description: "Your campaign has been updated successfully.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to update campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CampaignFormFields form={form} showAllFields={true} />
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}