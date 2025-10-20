import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Estado para o colapso da sidebar, persistido no localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Padrão para false se for a primeira vez, ou se estiver em mobile
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const handleToggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    // Se não estiver autenticado e não estiver carregando, redireciona para o login
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out`}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;