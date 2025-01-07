import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2 } from "lucide-react";
import { CampaignFormFields } from "./campaign/CampaignFormFields";
import type { CampaignFormData } from "@/types/campaign";

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const form = useForm<CampaignFormData>();

  const onSubmit = async (data: CampaignFormData, sendImmediately = false) => {
    try {
      setIsLoading(true);

      // Get the current user's ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      let mediaUrl = null;
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

      const { data: campaign, error } = await supabase.from("campaigns").insert({
        user_id: session.user.id,
        name: data.name,
        message: data.message,
        media_url: mediaUrl,
        scheduled_for: scheduledFor?.toISOString(),
        group_id: data.group_id,
        from_number: data.from_number,
        status: sendImmediately ? "sending" : "draft",
      }).select().single();

      if (error) throw error;

      if (sendImmediately && campaign) {
        setIsSending(true);
        const { error: sendError } = await supabase.functions.invoke('send-campaign', {
          body: { campaignId: campaign.id }
        });

        if (sendError) throw sendError;

        toast({
          title: "Campaign sent",
          description: "Your campaign is being sent to all contacts in the group.",
        });
      } else {
        toast({
          title: "Campaign created",
          description: "Your campaign has been saved as a draft.",
        });
      }

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Create a new campaign to send to your contacts.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))} className="space-y-6">
            <CampaignFormFields form={form} />
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={form.handleSubmit((data) => onSubmit(data, true))}
                disabled={isLoading || isSending}
                className="w-full sm:w-auto"
              >
                {isSending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Now
              </Button>
              <Button type="submit" disabled={isLoading || isSending} className="w-full sm:w-auto">
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save as Draft
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}