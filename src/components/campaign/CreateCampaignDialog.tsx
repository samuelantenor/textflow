import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { CampaignFormData } from "@/types/campaign";
import { useQuery } from "@tanstack/react-query";
import { CampaignFormFields } from "./CampaignFormFields";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<CampaignFormData>();

  // Check monthly usage and campaign limits
  const { data: limits } = useQuery({
    queryKey: ['user-plan-limits'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase.rpc('get_user_plan_limits', {
        user_id: session.user.id
      });

      if (error) throw error;
      return data[0];
    },
  });

  // Get current campaign count
  const { data: campaignCount } = useQuery({
    queryKey: ['campaign-count'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { count, error } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      if (error) throw error;
      return count || 0;
    },
  });

  const isAtCampaignLimit = (campaignCount || 0) >= (limits?.campaign_limit || 3);

  const onSubmit = async (data: CampaignFormData) => {
    try {
      if (isAtCampaignLimit) {
        toast({
          title: "Campaign limit reached",
          description: "Please upgrade your plan to create more campaigns.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("campaigns").insert({
        user_id: session.user.id,
        name: data.name,
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "Campaign created",
        description: "Your campaign has been saved as a draft.",
      });

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
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-500 hover:bg-primary-600">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-2xl h-[95vh] md:h-auto md:max-h-[85vh] p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <DialogTitle className="text-xl">Create New Campaign</DialogTitle>
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
                Create Campaign
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
