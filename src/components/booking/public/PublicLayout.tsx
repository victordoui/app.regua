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
      navigate(`/public-booking/${settings.company_name}/login`); // Redireciona para o login público
    } catch (error) {
      toast({ title: "Erro ao sair", variant: "destructive" });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (Desktop) */}
      <Card 
        className="hidden md:flex flex-col w-64 border-r border-border shadow-lg sticky top-0 h-screen bg-card"
        style={{ borderColor: settings.primary_color_hex }}
      >
        <div className="p-4 border-b" style={{ borderColor: settings.primary_color_hex }}>
          <div className="flex items-center gap-3">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <Scissors className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <h2 className="text-xl font-bold" style={{ color: settings.primary_color_hex }}>
              {settings.company_name}
            </h2>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              className={`w-full justify-start ${isActive(item.path) ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
              onClick={() => navigate(item.path)}
              style={isActive(item.path) ? { backgroundColor: settings.primary_color_hex, color: '#fff' } : {}}
            >
              <item.icon className="h-4 w-4 mr-3" />
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
      </Card>

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
            
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map(item => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive(item.path) ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                  style={isActive(item.path) ? { backgroundColor: settings.primary_color_hex, color: '#fff' } : {}}
                >
                  <item.icon className="h-4 w-4 mr-3" />
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
          </Card>
        </div>
      )}
    </div>
  );
};

export default PublicLayout;