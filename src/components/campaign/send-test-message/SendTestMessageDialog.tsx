import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SendHorizontal } from "lucide-react";
import { TestMessageForm } from "./TestMessageForm";
import type { SendTestMessageFormData } from "./types";

export function SendTestMessageDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: SendTestMessageFormData) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.functions.invoke('send-test-message', {
        body: { 
          fromNumber: data.fromNumber,
          phoneNumber: data.phoneNumber,
          message: data.message,
        },
      });

      if (error) throw error;

      toast({
        title: "Test message sent",
        description: "Your test message has been sent successfully.",
      });

      setOpen(false);
    } catch (error) {
      console.error("Error sending test message:", error);
      toast({
        title: "Error",
        description: "Failed to send test message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <SendHorizontal className="w-4 h-4 mr-2" />
          Send Test Message
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Send Test Message</DialogTitle>
          <DialogDescription>
            Send a test message to verify your configuration.
          </DialogDescription>
        </DialogHeader>
        <TestMessageForm 
          isLoading={isLoading}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}