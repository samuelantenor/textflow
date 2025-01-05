import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const DashboardHeader = () => {
  return (
    <div className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">SMS Campaigns</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-muted"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};