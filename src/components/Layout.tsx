import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import MobileSplashScreen from './MobileSplashScreen';
import { useIsMobile } from '@/hooks/use-mobile';
import vizzuLogo from '@/assets/vizzu-logo.png';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    const shown = sessionStorage.getItem('vizzu-splash-shown');
    return !shown && window.innerWidth < 768;
  });

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('vizzu-splash-shown', '1');
    setShowSplash(false);
  }, []);

  if (showSplash && isMobile) {
    return <MobileSplashScreen onComplete={handleSplashComplete} />;
  }

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <MobileTopbar />
        <main className="flex-1 overflow-auto px-4 pb-20 pt-14">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main className="flex-1 md:ml-[234px] overflow-auto px-8 pb-12 pt-[5rem]">
        {children}
      </main>
    </div>
  );
};

const MobileTopbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'VZ';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-background border-b border-border flex items-center justify-between px-4">
      <img src={vizzuLogo} alt="VIZZU" className="h-8 w-8 object-contain" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[11px] font-bold text-primary-foreground flex-shrink-0">
          {getUserInitials()}
        </div>
      </div>
    </header>
  );
};

export default Layout;
