import { ReactNode } from 'react';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export const SuperAdminLayout = ({ children }: SuperAdminLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <SuperAdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="flex justify-end p-4 border-b border-border">
          <ThemeToggle />
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};
