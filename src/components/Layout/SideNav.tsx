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
  Menu,
  X
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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

interface SideNavProps {
  className?: string;
}

export function SideNav({ className }: SideNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');
      if (isOpen && sidebar && !sidebar.contains(event.target as Node) && 
          menuButton && !menuButton.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Lock body scroll when menu is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        if (signOutError.message.includes('Auth session missing')) {
          navigate(`/${i18n.language}/login`, { replace: true });
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

      navigate(`/${i18n.language}/login`, { replace: true });
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      navigate(`/${i18n.language}/login`, { replace: true });
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
      return location.pathname === `/${i18n.language}${path}`;
    }
    const searchParams = new URLSearchParams(query);
    const currentSearchParams = new URLSearchParams(location.search);
    
    // If there's no tab in the current URL and we're checking the overview tab
    if (!currentSearchParams.get('tab') && searchParams.get('tab') === 'overview') {
      return location.pathname === `/${i18n.language}/dashboard`;
    }
    
    return location.pathname === `/${i18n.language}${path}` && 
           searchParams.get('tab') === currentSearchParams.get('tab');
  };

  // Helper function to get the localized href
  const getLocalizedHref = (href: string) => {
    const [path, query] = href.split('?');
    return query ? `/${i18n.language}${path}?${query}` : `/${i18n.language}${path}`;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        id="menu-button"
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "flex flex-col bg-gradient-to-b from-black to-gray-900 border-r border-gray-800/50 backdrop-blur-xl",
          className
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-gray-800/50">
          <Link to={`/${i18n.language}/dashboard`} className="flex items-center gap-2 group">
            <MessageSquare className="h-6 w-6 text-primary-500 fill-current transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              FlowText
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navigation.map((item, index) => {
              const isActive = isRouteActive(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={getLocalizedHref(item.href)}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 animate-fade-in',
                    'hover:bg-white/5 relative group',
                    isActive
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-gray-400 hover:text-white'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 transition-transform group-hover:scale-110",
                    isActive && "text-primary-500"
                  )} />
                  {item.name}
                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Account Navigation */}
          <div className="mt-8 pt-8 border-t border-gray-800/50">
            {accountNavigation.map((item, index) => {
              const isActive = isRouteActive(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={getLocalizedHref(item.href)}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 animate-fade-in',
                    'hover:bg-white/5 relative group',
                    isActive
                      ? 'bg-primary-500/10 text-primary-500'
                      : 'text-gray-400 hover:text-white'
                  )}
                  style={{ animationDelay: `${(index + navigation.length) * 100}ms` }}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 transition-transform group-hover:scale-110",
                    isActive && "text-primary-500"
                  )} />
                  {item.name}
                  {isActive && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 rounded-r-full" />
                  )}
                </Link>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2.5 mt-2 text-sm font-medium rounded-lg transition-all duration-200 w-full
                text-red-500 hover:bg-red-500/10 hover:text-red-400 group animate-fade-in"
              style={{ animationDelay: `${(navigation.length + accountNavigation.length) * 100}ms` }}
            >
              <LogOut className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
              Log out
            </button>
          </div>
        </nav>
      </div>
    </>
  );
} 
