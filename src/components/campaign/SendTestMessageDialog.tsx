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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, SendHorizontal, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SendTestMessageFormData {
  fromNumber: string;
  phoneNumber: string;
  message: string;
}

export function SendTestMessageDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<SendTestMessageFormData>();

  // Fetch user's phone numbers
  const { data: phoneNumbers } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

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
      form.reset();
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
        <Button variant="outline" size="sm">
          <SendHorizontal className="w-4 h-4 mr-2" />
          Send Test Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Test Message</DialogTitle>
          <DialogDescription>
            Send a test message to verify your configuration.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fromNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Number</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a number to send from">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{field.value}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {phoneNumbers?.map((number) => (
                        <SelectItem key={number.id} value={number.phone_number}>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{number.phone_number}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {(!phoneNumbers || phoneNumbers.length === 0) && (
                        <SelectItem value="" disabled>
                          No phone numbers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Number</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="+1234567890" 
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Type your test message here"
                      {...field}
                    />
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
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Test
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}