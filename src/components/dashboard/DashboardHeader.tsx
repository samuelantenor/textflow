import { Button } from "@/components/ui/button";
import { MessageSquare, Settings, LogOut, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation(['dashboard', 'common']);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate(`/${i18n.language}/login`);
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: t('common:errors.generic'),
        description: t('common:errors.tryAgain'),
      });
    }
  };

  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/${i18n.language}/dashboard`)}>
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">FlowText</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-muted"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t('common:navigation.account')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/${i18n.language}/billing`)}>
                <Receipt className="mr-2 h-4 w-4" />
                {t('common:navigation.billing')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/${i18n.language}/settings`)}>
                <Settings className="mr-2 h-4 w-4" />
                {t('common:navigation.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('common:navigation.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};