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

interface EditCampaignDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCampaignDialog({ campaign, open, onOpenChange }: EditCampaignDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
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

      const { error } = await supabase
        .from("campaigns")
        .update({
          name: data.name,
          message: data.message,
          media_url: mediaUrl,
          scheduled_for: scheduledFor?.toISOString(),
          group_id: data.group_id,
          from_number: data.from_number,
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
      <DialogContent className="w-[95vw] max-w-2xl h-[95vh] md:h-auto md:max-h-[85vh] p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <DialogTitle className="text-xl">Edit Campaign</DialogTitle>
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
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto order-1 sm:order-none"
              >
                Cancel
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600"
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
