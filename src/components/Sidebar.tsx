import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, Scissors, Settings, LogOut, ChevronLeft, ChevronRight, Building, MessageSquare, DollarSign, TrendingUp, Zap, BarChart3, Package, Plug, Crown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Agenda', icon: Calendar, path: '/appointments' },
  { name: 'Clientes', icon: Users, path: '/clients' },
  { name: 'Serviços', icon: Scissors, path: '/services' },
  { name: 'Caixa / PDV', icon: DollarSign, path: '/cash' },
];

const financeItems = [
  { name: 'Contas a Pagar/Receber', icon: TrendingUp, path: '/billing' },
  { name: 'Comissões', icon: DollarSign, path: '/commissions' },
  { name: 'Relatórios', icon: BarChart3, path: '/reports' },
  { name: 'Vendas', icon: DollarSign, path: '/sales-reports' },
];

const communicationItems = [
  { name: 'Conversas', icon: MessageSquare, path: '/conversations' },
  { name: 'Notificações', icon: Zap, path: '/advanced-notifications' },
  { name: 'Campanhas', icon: Zap, path: '/campaigns' },
];

const managementItems = [
  { name: 'Barbeiros', icon: Scissors, path: '/barbers' },
  { name: 'Assinaturas', icon: Crown, path: '/subscriptions' },
  { name: 'Estoque', icon: Package, path: '/inventory' },
  { name: 'Usuários', icon: Shield, path: '/users' },
];

const settingsItems = [
  { name: 'Dados da Empresa', icon: Building, path: '/settings/company' },
  { name: 'Integrações', icon: Plug, path: '/integrations' },
  { name: 'Configurações', icon: Settings, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { signOut } = useAuth();

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
        {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
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
        isCollapsed ? 'w-16' : 'w-64'
      } relative`}
    >
      {/* Logo/Header */}
      <div className={`flex items-center p-4 border-b ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-primary">Na Régua</h1>}
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
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-modern">
        {/* Main Items */}
        <div className="space-y-1">
          {!isCollapsed && <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-3">Principal</h3>}
          {navItems.map(renderNavItem)}
        </div>

        {/* Management Items */}
        <div className="space-y-1 pt-4 border-t border-border">
          {!isCollapsed && <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-3">Gestão</h3>}
          {managementItems.map(renderNavItem)}
        </div>

        {/* Finance Items */}
        <div className="space-y-1 pt-4 border-t border-border">
          {!isCollapsed && <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-3">Financeiro</h3>}
          {financeItems.map(renderNavItem)}
        </div>

        {/* Communication Items */}
        <div className="space-y-1 pt-4 border-t border-border">
          {!isCollapsed && <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-3">Comunicação</h3>}
          {communicationItems.map(renderNavItem)}
        </div>

        {/* Settings Items */}
        <div className="space-y-1 pt-4 border-t border-border">
          {!isCollapsed && <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-3">Configurações</h3>}
          {settingsItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Footer/Logout */}
      <div className={`p-4 border-t ${isCollapsed ? 'flex justify-center' : ''}`}>
        <Button 
          variant="ghost" 
          className={`w-full ${isCollapsed ? 'w-auto' : ''}`}
          onClick={signOut}
        >
          <LogOut className={`h-5 w-5 ${!isCollapsed ? 'mr-3' : ''}`} />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;