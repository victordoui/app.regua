import React, { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home, 
  Calendar, 
  Users, 
  CreditCard, 
  User, 
  LogOut, 
  Menu, 
  X,
  Scissors,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PublicLayoutProps {
  children: ReactNode;
  settings: {
    logo_url: string | null;
    company_name: string;
    primary_color_hex: string;
  };
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, settings }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Mock de dados do cliente (em um sistema real, viria do useAuth ou useProfile)
  const clientName = user?.user_metadata?.full_name || user?.email || 'Cliente';
  const clientInitials = clientName.charAt(0).toUpperCase();

  const menuItems = [
    { label: "Início", icon: Home, path: `/public-booking/${user?.id}/home` },
    { label: "Agendamentos", icon: Calendar, path: `/public-booking/${user?.id}/appointments` },
    { label: "Empresas Parceiras", icon: Briefcase, path: `/public-booking/${user?.id}/partners` },
    { label: "Plano", icon: CreditCard, path: `/public-booking/${user?.id}/plans` },
    { label: "Perfil", icon: User, path: `/public-booking/${user?.id}/profile` },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Logout realizado", description: "Você saiu da sua conta de cliente." });
      // Redireciona para o login público (usando o userId como identificador da barbearia)
      navigate(`/public-booking/${settings.company_name}/login`); 
    } catch (error) {
      toast({ title: "Erro ao sair", variant: "destructive" });
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const renderSidebarContent = (isMobileView: boolean) => (
    <>
      {/* Logo Grande no Topo */}
      <div className="p-6 border-b flex flex-col items-center justify-center">
        {settings.logo_url ? (
          <img 
            src={settings.logo_url} 
            alt="Logo" 
            className="h-auto w-full max-w-[180px] object-contain mb-4" 
          />
        ) : (
          <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-4">
            <Scissors className="h-10 w-10 text-primary-foreground" />
          </div>
        )}
        {/* Removendo o nome da empresa aqui para dar destaque total ao logo, como na imagem */}
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => (
          <Button
            key={item.path}
            variant="ghost"
            className={`w-full justify-start text-base font-medium h-12 ${
              isActive(item.path) 
                ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                : 'text-foreground hover:bg-muted'
            }`}
            onClick={() => { navigate(item.path); if (isMobileView) setIsSidebarOpen(false); }}
            style={isActive(item.path) ? { color: settings.primary_color_hex } : {}}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (Desktop) */}
      <div 
        className="hidden md:flex flex-col w-64 border-r border-border shadow-lg sticky top-0 h-screen bg-card"
      >
        {renderSidebarContent(false)}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <header className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-card shadow-sm">
          <div className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                <Scissors className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <h1 className="text-lg font-bold">{settings.company_name}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <Card className="absolute left-0 top-0 h-full w-64 flex flex-col bg-card shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{clientInitials}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{clientName}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {renderSidebarContent(true)}
          </Card>
        </div>
      )}
    </div>
  );
};

export default PublicLayout;