import { ReactNode } from 'react';
import { SideNav } from './SideNav';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <SideNav />
      <main className="pl-[0px]">
        <div className="min-h-screen bg-black text-white">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 
