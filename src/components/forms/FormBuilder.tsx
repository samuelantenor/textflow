import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormFieldBuilder } from "./FormFieldBuilder";
import { FormFieldList } from "./FormFieldList";
import { FormDesignTab } from "./form-builder/FormDesignTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormData } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

interface FormBuilderProps {
  groupId?: string;
}

export function FormBuilder({ groupId }: FormBuilderProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    defaultValues: {
      fields: [],
      group_id: groupId || "",
      background_color: "#FFFFFF",
      font_family: "Inter",
      primary_color: "#ea384c",
    },
  });

  const { data: groups } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("landing_page_assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("landing_page_assets")
        .getPublicUrl(fileName);
      
      form.setValue("logo_url", publicUrl);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("custom_forms").insert({
        user_id: session.user.id,
        group_id: data.group_id,
        title: data.title,
        description: data.description,
        fields: data.fields,
        background_color: data.background_color,
        font_family: data.font_family,
        logo_url: data.logo_url,
        primary_color: data.primary_color,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form created successfully.",
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating form:", error);
      toast({
        title: "Error",
        description: "Failed to create form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Form
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Custom Form</DialogTitle>
          <DialogDescription>
            Build a beautiful form to collect information from your contacts.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList>
                <TabsTrigger value="fields">Form Fields</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="flex-1 overflow-auto">
                <div className="space-y-4">
                  <div className="space-y-4 bg-muted/50 rounded-lg p-4">
                    <Input
                      placeholder="Enter form title"
                      className="text-xl font-semibold bg-background"
                      {...form.register("title", { required: true })}
                    />
                    <Textarea
                      placeholder="Describe your form (optional)"
                      className="bg-background"
                      {...form.register("description")}
                    />
                    <div className="space-y-2">
                      <Label>Select Contact Group</Label>
                      <select
                        {...form.register("group_id", { required: true })}
                        className="w-full p-2 border rounded"
                      >
                        {groups?.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <FormFieldBuilder form={form} />
                  <FormFieldList form={form} />
                </div>
              </TabsContent>

              <TabsContent value="design" className="flex-1 overflow-auto">
                <FormDesignTab form={form} handleLogoUpload={handleLogoUpload} />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-background p-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Form"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}