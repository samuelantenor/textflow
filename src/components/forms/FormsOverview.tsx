import { Card } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { FormBuilder } from "./FormBuilder";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "../ui/button";

type CustomForm = {
  id: string;
  title: string;
  description: string | null;
  fields: any[];
  campaign_groups: {
    name: string;
  } | null;
};

export const FormsOverview = () => {
  const { data: groups } = useQuery({
    queryKey: ['campaign-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_groups')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: forms, isLoading } = useQuery<CustomForm[]>({
    queryKey: ['custom-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms')
        .select(`
          *,
          campaign_groups (
            name
          )
        `);
      
      if (error) throw error;
      return data;
    },
  });

  if (!groups?.length) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Forms</h2>
          <Card className="p-12 text-center space-y-4 mt-4">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Create a Contact Group First</h3>
              <p className="text-muted-foreground">
                You need to create a contact group before you can create a form.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Forms</h2>
        <FormBuilder groupId={groups[0].id} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ) : forms?.length ? (
          forms.map((form) => (
            <Card key={form.id} className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{form.title}</h3>
                {form.description && (
                  <p className="text-sm text-muted-foreground">{form.description}</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Group: {form.campaign_groups?.name}
              </div>
              <div className="text-sm text-muted-foreground">
                Fields: {form.fields.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  View Submissions
                </Button>
                <Button variant="outline" size="sm">
                  Share Form
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center space-y-4 col-span-full">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No Forms Yet</h3>
              <p className="text-muted-foreground">
                Create your first form to start collecting contacts.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};