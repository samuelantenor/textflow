import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CreateCampaignButton } from "@/components/CreateCampaignButton";
import StatsDisplay from "@/components/StatsDisplay";
import CampaignTable from "@/components/CampaignTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      // If authenticated, redirect to dashboard
      navigate("/dashboard");
    };
    
    checkAuth();
  }, []); // Empty dependency array means this runs once on mount

  return null; // Return null while checking auth and redirecting
};

const UserMenu = ({ onLogout }: { onLogout: () => Promise<void> }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Index;