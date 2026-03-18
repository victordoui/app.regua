import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main className="flex-1 md:ml-[234px] overflow-auto p-7 pb-10 pt-[4.5rem]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
