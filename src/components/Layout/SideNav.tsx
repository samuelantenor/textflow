import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  Phone,
  Settings,
  BarChart
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: MessageSquare },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Forms', href: '/forms', icon: FileText },
  { name: 'Phone Numbers', href: '/phone-numbers', icon: Phone },
  { name: 'Analytics', href: '/analytics', icon: BarChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function SideNav() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col fixed left-0 top-0 bg-black border-r border-gray-800">
      <div className="flex h-16 items-center px-4 border-b border-gray-800">
        <Link to="/dashboard" className="flex items-center">
          <span className="text-xl font-semibold text-red-500">FlowText</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
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
      </nav>
    </div>
  );
} 