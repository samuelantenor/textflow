import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const FormsOverview = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Forms</h2>
        <Card className="p-12 text-center space-y-4 mt-4">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No Forms Created</h3>
            <p className="text-muted-foreground">
              Create your first form to start collecting information.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};