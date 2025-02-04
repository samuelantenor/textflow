import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  Phone,
  Settings,
  Receipt,
  LogOut,
  Square
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: 'Overview', href: '/dashboard?tab=overview', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/dashboard?tab=campaigns', icon: MessageSquare },
  { name: 'Groups', href: '/dashboard?tab=groups', icon: Users },
  { name: 'Forms', href: '/dashboard?tab=forms', icon: FileText },
  { name: 'Phone Numbers', href: '/dashboard?tab=phone-numbers', icon: Phone },
];

const accountNavigation = [
  { name: 'Billing', href: '/billing', icon: Receipt },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        if (signOutError.message.includes('Auth session missing')) {
          navigate("/login", { replace: true });
          return;
        }
        
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: signOutError.message,
        });
      } else {
        toast({
          title: "Signed out successfully",
          description: "You have been logged out of your account.",
        });
      }

      navigate("/login", { replace: true });
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      navigate("/login", { replace: true });
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "An unexpected error occurred, but you've been redirected to the login page.",
      });
    }
  };

  // Helper function to check if a route is active, including query parameters
  const isRouteActive = (href: string) => {
    const [path, query] = href.split('?');
    if (!query) {
      return location.pathname === path;
    }
    const searchParams = new URLSearchParams(query);
    const currentSearchParams = new URLSearchParams(location.search);
    
    // If there's no tab in the current URL and we're checking the overview tab
    if (!currentSearchParams.get('tab') && searchParams.get('tab') === 'overview') {
      return location.pathname === '/dashboard';
    }
    
    return location.pathname === path && 
           searchParams.get('tab') === currentSearchParams.get('tab');
  };

  return (
    <div className="flex h-screen w-64 flex-col fixed left-0 top-0 bg-black border-r border-gray-800">
      <div className="flex h-16 items-center px-4 border-b border-gray-800">
        <Link to="/dashboard" className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-red-500 fill-current" />
          <span className="text-xl font-semibold text-white">FlowText</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = isRouteActive(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Account Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          {accountNavigation.map((item) => {
            const isActive = isRouteActive(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center px-3 py-2 mt-2 text-sm font-medium rounded-md transition-colors w-full text-red-500 hover:bg-gray-900 hover:text-red-400"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log out
          </button>
        </div>
      </nav>
    </div>
  );
} 
