import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { CampaignFormFields } from "./CampaignFormFields";
import { Campaign, CampaignFormData } from "./types";
import { useState } from "react";

interface EditCampaignDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCampaignDialog({ campaign, open, onOpenChange }: EditCampaignDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<CampaignFormData>({
    defaultValues: {
      name: campaign.name,
      message: campaign.message,
      scheduled_for: campaign.scheduled_for ? new Date(campaign.scheduled_for) : undefined,
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

      const { error } = await supabase
        .from("campaigns")
        .update({
          name: data.name,
          message: data.message,
          media_url: mediaUrl,
          scheduled_for: data.scheduled_for?.toISOString(),
        })
        .eq('id', campaign.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CampaignFormFields form={form} />
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
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