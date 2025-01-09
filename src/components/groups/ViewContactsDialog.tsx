import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { EditContactDialog } from "./EditContactDialog";
import { Pencil, Trash2, Search } from "lucide-react";

interface ViewContactsDialogProps {
  group: {
    id: string;
    name: string;
    contacts: { count: number }[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewContactsDialog({ group, open, onOpenChange }: ViewContactsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingContact, setEditingContact] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', group.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('group_id', group.id)  // Add this line to satisfy RLS policy
        .eq('id', contactId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
      
      // Invalidate both contacts and campaign-groups queries
      queryClient.invalidateQueries({ queryKey: ['contacts', group.id] });
      queryClient.invalidateQueries({ queryKey: ['campaign-groups'] });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredContacts = contacts?.filter(contact => 
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>View Contacts</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredContacts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No contacts found</TableCell>
                  </TableRow>
                ) : (
                  filteredContacts?.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.name || "N/A"}</TableCell>
                      <TableCell>{contact.phone_number}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingContact(contact)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(contact.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {editingContact && (
        <EditContactDialog
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
        />
      )}
    </>
  );
}