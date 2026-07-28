import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import MobileSplashScreen from './MobileSplashScreen';
import { useIsMobile } from '@/hooks/use-mobile';
import vizzuLogo from '@/assets/vizzu-icon.png';
import { Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

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
      <div className="readable-ui flex min-h-screen flex-col bg-[hsl(var(--page))]">
        <MobileTopbar />
        <main className="flex-1 overflow-auto px-4 pb-24 pt-[4.75rem]">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="readable-ui flex h-screen bg-[hsl(var(--page))]">
      <Sidebar />
      <Topbar />
      <main className="flex-1 overflow-auto px-6 pb-12 pt-[5.25rem] transition-[margin] duration-200 md:ml-[var(--sidebar-w)] xl:px-8">
        {children}
      </main>
    </div>
  );
};

const MobileTopbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const routeTitles: Record<string, string> = {
    '/': 'Visão Geral',
    '/appointments': 'Agenda',
    '/clients': 'Clientes',
    '/barbers': 'Profissionais',
    '/services': 'Serviços',
    '/settings/company': 'Minha Empresa',
    '/profile': 'Meu Perfil',
  };

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'VZ';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-4 shadow-sm backdrop-blur-xl">
      <button onClick={() => navigate('/')} className="flex min-w-0 items-center gap-2.5 rounded-lg text-left">
        <img src={vizzuLogo} alt="VIZZU" className="h-9 w-9 object-contain" />
        <div className="min-w-0">
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">VIZZU</span>
          <span className="block truncate text-sm font-bold text-foreground">{routeTitles[location.pathname] || 'Painel'}</span>
        </div>
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
        <button onClick={() => navigate('/profile')} className="flex h-9 items-center gap-1 rounded-full border border-border bg-card pl-1 pr-2 shadow-sm">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-[10px] font-bold text-primary-foreground">
          {getUserInitials()}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Layout;
