import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { CampaignFormFields } from "@/components/campaign/CampaignFormFields";
import type { CampaignFormData } from "@/types/campaign";
import { useState } from "react";

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
        group_id: data.group_id,
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "Campaign created",
        description: "Your campaign has been saved as a draft.",
      });

      navigate("/dashboard?tab=campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard?tab=campaigns")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create New Campaign</h1>
            <p className="text-muted-foreground mt-2">
              Set up your campaign details and schedule your message.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <CampaignFormFields form={form} />
                
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
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
                    Save as Draft
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;