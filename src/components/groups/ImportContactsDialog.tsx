import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";

interface ImportContactsDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportContactsDialog({ groupId, open, onOpenChange }: ImportContactsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        const rows = text.split('\n');
        const contacts = rows
          .map((row) => {
            const [name, phone_number] = row.split(',').map((field) => field.trim());
            // Basic phone number validation
            const phoneRegex = /^\+?[\d\s-()]+$/;
            if (!phone_number || !phoneRegex.test(phone_number)) return null;
            return {
              group_id: groupId,
              name: name || null,
              phone_number: phone_number.replace(/[\s-()]/g, ''), // Normalize phone number
            };
          })
          .filter((contact): contact is { group_id: string; name: string | null; phone_number: string } => 
            contact !== null
          );

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
          <p className="text-sm text-gray-500">
            Upload a CSV file with contacts. The file should have two columns: name and phone number.
          </p>
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <div className="flex flex-col items-center gap-2 p-8 border-2 border-dashed rounded-lg hover:bg-gray-50">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {isLoading ? "Uploading..." : "Click to upload CSV"}
                </span>
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}