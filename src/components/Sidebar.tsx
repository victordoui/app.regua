import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, Scissors, Settings, LogOut, ChevronLeft, ChevronRight, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Agenda', icon: Calendar, path: '/agenda' },
  { name: 'Clientes', icon: Users, path: '/clients' },
  { name: 'Serviços', icon: Scissors, path: '/services' },
];

const settingsItems = [
  { name: 'Dados da Empresa', icon: Building, path: '/settings/company' },
  { name: 'Configurações', icon: Settings, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const renderNavItem = (item: { name: string, icon: React.ElementType, path: string }) => {
    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    const Icon = item.icon;

    const content = (
      <Link
        to={item.path}
        className={`flex items-center p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        } ${isCollapsed ? 'justify-center' : ''}`}
      >
        <Icon className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
        {!isCollapsed && <span className="font-medium">{item.name}</span>}
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider key={item.name}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right">{item.name}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <div key={item.name}>{content}</div>;
  };

  const ToggleIcon = isCollapsed ? ChevronRight : ChevronLeft;

  return (
    <div
      className={`flex flex-col h-full border-r bg-card transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Header */}
      <div className={`flex items-center p-4 border-b ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-primary">BarberApp</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={`h-8 w-8 ${isCollapsed ? 'absolute top-4 right-[-16px] z-20 bg-background border shadow-md' : ''}`}
        >
          <ToggleIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Items */}
        <div className="space-y-1">
          {!isCollapsed && <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-3">Principal</h3>}
          {navItems.map(renderNavItem)}
        </div>

        {/* Settings Items */}
        <div className="space-y-1 pt-4 border-t">
          {!isCollapsed && <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-3">Minha Empresa</h3>}
          {settingsItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Footer/Logout */}
      <div className={`p-4 border-t ${isCollapsed ? 'flex justify-center' : ''}`}>
        <Button variant="ghost" className={`w-full ${isCollapsed ? 'w-auto' : ''}`}>
          <LogOut className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;