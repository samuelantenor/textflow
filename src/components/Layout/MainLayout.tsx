import { ReactNode } from 'react';
import { SideNav } from './SideNav';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const isFormView = location.pathname.startsWith('/forms/');

  return (
    <div className="min-h-screen bg-black">
      {!isFormView && <SideNav />}
      <main className={cn(
        "transition-[padding] duration-300",
        !isFormView && "md:pl-64"
      )}>
        <div className="min-h-screen bg-black text-white">
          <div className="mx-auto px-0 sm:px-0 lg:px-0 py-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 
