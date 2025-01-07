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

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<CampaignFormData>();

  // Check monthly usage
  const { data: messageStats } = useQuery({
    queryKey: ['message_stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: messageLogs, error: messageLogsError } = await supabase
        .from('message_logs')
        .select(`
          *,
          campaigns!inner(*)
        `)
        .eq('campaigns.user_id', session.user.id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (messageLogsError) throw messageLogsError;
      return messageLogs?.length || 0;
    },
  });

  const monthlyLimit = 1000;
  const isLimitReached = (messageStats || 0) >= monthlyLimit;

  const onSubmit = async (data: CampaignFormData) => {
    try {
      if (isLimitReached) {
        toast({
          title: "Monthly limit reached",
          description: "Please upgrade your plan to send more messages.",
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
        <Button disabled={isLimitReached}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter campaign name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isLimitReached}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Campaign
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}