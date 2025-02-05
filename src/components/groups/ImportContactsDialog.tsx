import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { ImportInstructions } from "./ImportInstructions";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface ImportContactsDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Contact {
  name?: string;
  phone_number: string;
  group_id: string;
}

function processCSVContacts(csvText: string, groupId: string): Contact[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) return []; // Empty or invalid CSV

  const contacts: Contact[] = [];
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Basic phone number validation

  // Skip header row and process each line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [name = '', phone = ''] = line.split(',').map(field => field.trim());
    const phoneNumber = phone.replace(/[^+\d]/g, ''); // Clean phone number

    if (phoneNumber && phoneRegex.test(phoneNumber)) {
      contacts.push({
        name: name || undefined, // Only include name if it exists
        phone_number: phoneNumber,
        group_id: groupId
      });
    }
  }

  return contacts;
}

export function ImportContactsDialog({ groupId, open, onOpenChange }: ImportContactsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(['groups']);

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
          title: t('contacts.import.success'),
          description: `${contacts.length} contacts imported successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ['contacts', groupId] });
        queryClient.invalidateQueries({ queryKey: ['campaign-groups'] });
        onOpenChange(false);
      } catch (error) {
        toast({
          title: t('contacts.import.error'),
          description: error instanceof Error ? error.message : t('contacts.import.error'),
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
          <DialogTitle>{t('contacts.import.title')}</DialogTitle>
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