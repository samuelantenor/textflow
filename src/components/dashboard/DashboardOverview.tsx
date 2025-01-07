import { Card } from "@/components/ui/card";
import { MessageSquare, Users, BarChart3, FileText } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface DashboardOverviewProps {
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export const DashboardOverview = ({ setActiveTab }: DashboardOverviewProps) => {
  const quickActions = [
    {
      title: "New Campaign",
      description: "Create and send SMS campaigns",
      icon: MessageSquare,
      tab: "campaigns"
    },
    {
      title: "Contact Groups",
      description: "Manage your contact lists",
      icon: Users,
      tab: "groups"
    },
    {
      title: "Forms",
      description: "Create and manage forms",
      icon: FileText,
      tab: "forms"
    },
    {
      title: "Analytics",
      description: "View campaign performance",
      icon: BarChart3,
      tab: "analytics"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.title}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setActiveTab(action.tab)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <action.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};