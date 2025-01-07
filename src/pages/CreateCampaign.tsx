import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { CampaignFormFields } from "@/components/campaign/CampaignFormFields";
import type { CampaignFormData } from "@/types/campaign";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<CampaignFormData>();

  const onSubmit = async (data: CampaignFormData) => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      let mediaUrl = null;
      if (data.media) {
        if (data.media.size > 10 * 1024 * 1024) {
          toast({
            title: "Error",
            description: "Image size must be less than 10MB",
            variant: "destructive",
          });
          return;
        }

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

      const { error } = await supabase.from("campaigns").insert({
        user_id: session.user.id,
        name: data.name,
        message: data.message,
        media_url: mediaUrl,
        scheduled_for: scheduledFor?.toISOString(),
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign created successfully",
      });

      navigate("/dashboard?tab=campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard?tab=campaigns")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Create New Campaign</h1>
            <p className="text-muted-foreground">
              Create a new campaign to send to your contacts.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CampaignFormFields form={form} />
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard?tab=campaigns")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Campaign
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;