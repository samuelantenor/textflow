import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { FileUpload } from "@/components/ui/file-upload";
import { ImportInstructions } from "./ImportInstructions";
import { processCSVContacts } from "@/utils/csvUtils";

interface ImportContactsDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportContactsDialog({ groupId, open, onOpenChange }: ImportContactsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        const contacts = processCSVContacts(text, groupId);

        if (contacts.length === 0) {
          throw new Error("No valid contacts found in CSV");
        }

        const { error } = await supabase
          .from('contacts')
          .insert(contacts);

        if (error) throw error;

        toast({
          title: "Success",
          description: `${contacts.length} contacts imported successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ['contacts', groupId] });
        queryClient.invalidateQueries({ queryKey: ['campaign-groups'] });
        onOpenChange(false);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to import contacts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ImportInstructions />
          <div className="flex justify-center">
            <FileUpload
              onFileSelect={handleFileUpload}
              isLoading={isLoading}
              accept=".csv"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}