import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const EmptyFormsState = () => {
  return (
    <Card className="p-12 text-center space-y-4 col-span-full">
      <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
      <div>
        <h3 className="text-lg font-semibold">No Forms Yet</h3>
        <p className="text-muted-foreground">
          Create your first form to start collecting contacts.
        </p>
      </div>
    </Card>
  );
};