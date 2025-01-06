import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { FormBuilder } from "./FormBuilder";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    </div>
  );
};