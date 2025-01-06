import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ViewSubmissionsDialogProps {
  formId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewSubmissionsDialog({ formId, open, onOpenChange }: ViewSubmissionsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['form-submissions', formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: form } = useQuery({
    queryKey: ['form-details', formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms')
        .select('fields')
        .eq('id', formId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const filteredSubmissions = submissions?.filter(submission => {
    if (!searchTerm) return true;
    
    return Object.values(submission.data).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Form Submissions</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {form?.fields.map((field: { label: string }) => (
                  <TableHead key={field.label}>{field.label}</TableHead>
                ))}
                <TableHead>Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell 
                    colSpan={form?.fields.length + 1} 
                    className="text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredSubmissions?.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={form?.fields.length + 1} 
                    className="text-center"
                  >
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions?.map((submission) => (
                  <TableRow key={submission.id}>
                    {form?.fields.map((field: { label: string }) => (
                      <TableCell key={field.label}>
                        {submission.data[field.label] || 'N/A'}
                      </TableCell>
                    ))}
                    <TableCell>
                      {new Date(submission.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}