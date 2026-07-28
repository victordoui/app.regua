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
      className="min-h-[100dvh] bg-muted/30 flex flex-col"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex w-full max-w-lg items-center gap-3">
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
          <h1 className="min-w-0 truncate text-base font-bold text-foreground">
            {settings?.company_name || 'Barbearia'}
          </h1>
        </div>
      </header>

      {/* Main Content - with padding for bottom nav */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur safe-area-pb" aria-label="Navegação principal">
        <div className="mx-auto grid w-full max-w-lg grid-cols-4 px-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                type="button"
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                className={cn(
                  "relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors duration-200",
                  active 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    active && "scale-105"
                  )} 
                  style={active && settings?.primary_color_hex ? { color: settings.primary_color_hex } : undefined}
                />
                <span className={cn(
                  "text-[11px] font-semibold leading-none",
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
