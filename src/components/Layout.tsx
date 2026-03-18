import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Sidebar from './Sidebar';
import { 
  LogOut, 
  Menu, 
  X, 
  Settings,
  Bell,
  UserCircle,
  Search,
  ChevronDown
} from "lucide-react";
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import TrialBanner from '@/components/TrialBanner';

interface LayoutProps {
  children?: React.ReactNode;
}

const formatDate = () => {
  const now = new Date();
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null);
    if (!error && count !== null) setUnreadCount(count);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('layout-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` }, () => fetchUnreadCount())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Logout realizado", description: "Você saiu do sistema com sucesso." });
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({ title: "Erro ao sair", description: "Ocorreu um erro ao tentar sair.", variant: "destructive" });
    }
  };

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return user.user_metadata.full_name.split(' ').map((w: string) => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getUserName = () => user?.user_metadata?.full_name || user?.email || 'Usuário';

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar — glassmorphism */}
        <header
          className="px-4 lg:px-6 h-[60px] flex items-center justify-between gap-4 sticky top-0 z-10"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(34, 96, 184, 0.10)',
            boxShadow: '0 1px 12px rgba(34, 96, 184, 0.06)',
          }}
        >
          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-[400px] hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'hsl(210, 25%, 75%)' }} />
              <input
                placeholder="Buscar..."
                className="w-full pl-9 pr-12 h-9 rounded-[10px] text-[13px] font-open-sans outline-none transition-all duration-200"
                style={{
                  background: 'hsl(216, 100%, 98%)',
                  border: '1px solid rgba(34, 96, 184, 0.10)',
                  color: 'hsl(215, 60%, 15%)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3278D4';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,96,184,0.10)';
                  e.currentTarget.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(34,96,184,0.10)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'hsl(216, 100%, 98%)';
                }}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-open-sans px-1.5 py-0.5 rounded"
                style={{
                  border: '1px solid rgba(34,96,184,0.18)',
                  color: 'hsl(210, 25%, 60%)',
                }}
              >⌘K</span>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-1.5">
            <TrialBanner />

            {/* Date pill */}
            <span
              className="text-[11px] font-open-sans hidden lg:block whitespace-nowrap px-2.5 py-1 rounded-full"
              style={{
                color: 'hsl(210, 25%, 60%)',
                background: 'hsl(214, 100%, 95%)',
              }}
            >{formatDate()}</span>

            {/* Bell */}
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground relative"
              onClick={() => handleNavigate('/notifications')}
            >
              <Bell className="h-[1.1rem] w-[1.1rem]" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full text-[9px] font-semibold text-white"
                  style={{ background: '#DC2626' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 rounded-full px-1.5 gap-1.5 hover:bg-accent">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #2260B8, #3A7FD8)',
                    }}
                  >
                    <span className="text-[10px] font-montserrat font-bold text-white">{getUserInitials()}</span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold font-montserrat leading-none">{getUserName()}</p>
                    <p className="text-xs leading-none text-muted-foreground font-open-sans">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleNavigate('/profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-64 bg-card shadow-xl">
            <div className="p-4" style={{ borderBottom: '1px solid rgba(34,96,184,0.10)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #2260B8, #3A7FD8)' }}
                  >
                    <span className="text-xs font-montserrat font-bold text-white">{getUserInitials()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold font-montserrat">{getUserName()}</p>
                    <p className="text-xs text-muted-foreground font-open-sans">{user?.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => handleNavigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
