import { Card } from "@/components/ui/card";
import { MessageSquare, Users, BarChart3 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface DashboardOverviewProps {
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export const DashboardOverview = ({ setActiveTab }: DashboardOverviewProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card 
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setActiveTab("campaigns")}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Campaigns</h3>
            <p className="text-sm text-muted-foreground">Create and manage campaigns</p>
          </div>
        </div>
      </Card>

      <Card 
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setActiveTab("groups")}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Groups</h3>
            <p className="text-sm text-muted-foreground">Manage contact groups</p>
          </div>
        </div>
      </Card>

      <Card 
        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setActiveTab("analytics")}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Analytics</h3>
            <p className="text-sm text-muted-foreground">View campaign performance</p>
          </div>
        </div>
      </Card>
    </div>
  );
};