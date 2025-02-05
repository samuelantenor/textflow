import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditContactDialogProps {
  contact: {
    id: string;
    name: string | null;
    phone_number: string;
    group_id: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContactDialog({ contact, open, onOpenChange }: EditContactDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: contact.name || "",
      phone_number: contact.phone_number,
    },
  });

  const onSubmit = async (values: { name: string; phone_number: string }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: values.name,
          phone_number: values.phone_number,
        })
        .eq('id', contact.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['contacts', contact.group_id] });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Contact"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}