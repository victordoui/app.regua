import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, CalendarPlus, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  settings?: {
    company_name: string;
    logo_url: string | null;
    primary_color_hex: string;
    secondary_color_hex: string;
  };
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, settings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  
  const basePath = `/b/${userId}`;
  
  const navItems = [
    { icon: Home, label: "Início", path: `${basePath}/home` },
    { icon: CalendarPlus, label: "Agendar", path: `${basePath}/agendar` },
    { icon: Calendar, label: "Meus Cortes", path: `${basePath}/agendamentos` },
    { icon: User, label: "Perfil", path: `${basePath}/perfil` },
  ];

  const isActive = (path: string) => location.pathname === path;

  // CSS custom properties for dynamic theming
  const dynamicStyles = settings ? {
    '--mobile-primary': settings.primary_color_hex,
    '--mobile-secondary': settings.secondary_color_hex,
  } as React.CSSProperties : {};

  return (
    <div 
      style={dynamicStyles}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          {settings?.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings.company_name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div 
              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: settings?.primary_color_hex || 'hsl(var(--primary))' }}
            >
              {settings?.company_name?.charAt(0) || 'B'}
            </div>
          )}
          <h1 className="text-lg font-semibold text-foreground">
            {settings?.company_name || 'Barbearia'}
          </h1>
        </div>
      </header>

      {/* Main Content - with padding for bottom nav */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[64px] rounded-lg transition-all duration-200",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-transform duration-200",
                    active && "scale-110"
                  )} 
                  style={active && settings?.primary_color_hex ? { color: settings.primary_color_hex } : undefined}
                />
                <span className={cn(
                  "text-xs font-medium",
                  active && "font-semibold"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
