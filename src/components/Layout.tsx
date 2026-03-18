import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-[234px] overflow-auto p-7 pb-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
