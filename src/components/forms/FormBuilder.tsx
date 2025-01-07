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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Save, Loader2 } from "lucide-react";
import { FormFieldBuilder } from "./FormFieldBuilder";
import { FormFieldList } from "./FormFieldList";
import { FormPreview } from "./FormPreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FormBuilderProps {
  groupId?: string;
}

interface FormData {
  title: string;
  description?: string;
  group_id: string;
  background_color?: string;
  font_family?: string;
  logo_url?: string;
  primary_color?: string;
  fields: Array<{
    type: 'text' | 'email' | 'phone' | 'checkbox' | 'textarea' | 'number' | 'date' | 'radio' | 'select';
    label: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    description?: string;
  }>;
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
];

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

  // Fetch available groups
  const { data: groups } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('campaign_groups')
        .select('id, name')
        .eq('user_id', session.user.id);
      
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
        title: "Form created",
        description: "Your custom form has been created successfully.",
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

  const formData = form.watch();

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
              <TabsList className="mb-4">
                <TabsTrigger value="fields">Form Fields</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="flex-1 overflow-hidden">
                <div className="grid grid-cols-2 gap-8 h-full">
                  <ScrollArea className="h-[calc(90vh-220px)]">
                    <div className="space-y-4 pr-4">
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
                          <label className="text-sm font-medium">Select Contact Group</label>
                          <Select
                            value={form.watch("group_id")}
                            onValueChange={(value) => form.setValue("group_id", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                              {groups?.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <FormFieldBuilder form={form} />
                      <FormFieldList form={form} />
                    </div>
                  </ScrollArea>
                  <ScrollArea className="h-[calc(90vh-220px)]">
                    <FormPreview
                      title={formData.title}
                      description={formData.description}
                      fields={formData.fields}
                      customization={{
                        backgroundColor: formData.background_color,
                        fontFamily: formData.font_family,
                        logoUrl: formData.logo_url,
                        primaryColor: formData.primary_color,
                      }}
                    />
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="design" className="flex-1 overflow-hidden">
                <div className="grid grid-cols-2 gap-8 h-full">
                  <ScrollArea className="h-[calc(90vh-220px)]">
                    <div className="space-y-6 pr-4">
                      <div className="space-y-4">
                        <Label>Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="w-12 h-12 p-1"
                            {...form.register("background_color")}
                          />
                          <Input
                            type="text"
                            className="flex-1"
                            {...form.register("background_color")}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="w-12 h-12 p-1"
                            {...form.register("primary_color")}
                          />
                          <Input
                            type="text"
                            className="flex-1"
                            {...form.register("primary_color")}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Font Family</Label>
                        <Select
                          value={form.watch("font_family")}
                          onValueChange={(value) => form.setValue("font_family", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a font" />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_OPTIONS.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label>Logo</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file);
                          }}
                        />
                        {formData.logo_url && (
                          <div className="mt-2">
                            <img
                              src={formData.logo_url}
                              alt="Form logo"
                              className="max-h-20 rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                  <ScrollArea className="h-[calc(90vh-220px)]">
                    <FormPreview
                      title={formData.title}
                      description={formData.description}
                      fields={formData.fields}
                      customization={{
                        backgroundColor: formData.background_color,
                        fontFamily: formData.font_family,
                        logoUrl: formData.logo_url,
                        primaryColor: formData.primary_color,
                      }}
                    />
                  </ScrollArea>
                </div>
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
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                Save Form
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}