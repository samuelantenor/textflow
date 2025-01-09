import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/types/form";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2 } from "lucide-react";

interface ViewSubmissionsDialogProps {
  formId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormDetails {
  fields: FormField[];
}

export function ViewSubmissionsDialog({ formId, open, onOpenChange }: ViewSubmissionsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['form-submissions', formId],
    queryFn: async () => {
      if (!formId) return [];
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!formId && open,
  });

  const { data: form, isLoading: isLoadingForm } = useQuery({
    queryKey: ['form-details', formId],
    queryFn: async () => {
      if (!formId) return null;
      const { data, error } = await supabase
        .from('custom_forms')
        .select('fields')
        .eq('id', formId)
        .single();

      if (error) throw error;
      const formFields = (data?.fields as unknown) as FormField[];
      return { fields: formFields } as FormDetails;
    },
    enabled: !!formId && open,
  });

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    if (!debouncedSearchTerm) return submissions;
    
    return submissions.filter(submission => 
      Object.values(submission.data).some(value => 
        String(value).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [submissions, debouncedSearchTerm]);

  const isLoading = isLoadingSubmissions || isLoadingForm;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Form Submissions</DialogTitle>
          <DialogDescription>
            View and search through all submissions for this form
          </DialogDescription>
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
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {form?.fields?.map((field: FormField) => (
                    <TableHead key={field.label}>{field.label}</TableHead>
                  ))}
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={(form?.fields?.length || 0) + 1} 
                      className="text-center"
                    >
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      {form?.fields?.map((field: FormField) => (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}