import { BarChart3, MessageSquare, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const StatsDisplay = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="campaign-card p-6">
        <div className="flex items-center gap-4">
          <MessageSquare className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Total Messages</p>
            <h3 className="text-2xl font-bold">12,543</h3>
          </div>
        </div>
      </Card>
      
      <Card className="campaign-card p-6">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Recipients</p>
            <h3 className="text-2xl font-bold">5,271</h3>
          </div>
        </div>
      </Card>
      
      <Card className="campaign-card p-6">
        <div className="flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Open Rate</p>
            <h3 className="text-2xl font-bold">98.3%</h3>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsDisplay;