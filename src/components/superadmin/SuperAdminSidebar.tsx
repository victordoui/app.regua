import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Ticket,
  ScrollText,
  LogOut,
  Shield,
  DollarSign,
  CalendarClock,
  CreditCard,
  Send,
  Mail,
  Settings,
  Headphones,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTicketStats } from '@/hooks/superadmin/useSupportTickets';
import { useExpiringStats } from '@/hooks/superadmin/useExpiringSubscriptions';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface MenuGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

const SuperAdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(['overview', 'subscribers']);
  
  const { data: ticketStats } = useTicketStats();
  const { data: expiringStats } = useExpiringStats();

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const menuGroups: Record<string, MenuGroup> = {
    overview: {
      title: 'Visão Geral',
      icon: LayoutDashboard,
      items: [
        { title: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
        { title: 'Métricas Financeiras', href: '/superadmin/metrics', icon: DollarSign },
      ],
    },
    subscribers: {
      title: 'Gestão de Assinantes',
      icon: Users,
      items: [
        { title: 'Assinantes', href: '/superadmin/subscribers', icon: Users },
        { 
          title: 'Assinaturas Expirando', 
          href: '/superadmin/expiring', 
          icon: CalendarClock,
          badge: expiringStats?.expiring7Days,
        },
        { title: 'Histórico de Pagamentos', href: '/superadmin/payments', icon: CreditCard },
      ],
    },
    marketing: {
      title: 'Marketing & Comunicação',
      icon: Send,
      items: [
        { title: 'Cupons da Plataforma', href: '/superadmin/coupons', icon: Ticket },
        { title: 'Mensagens em Massa', href: '/superadmin/broadcast', icon: Send },
        { title: 'Templates de Email', href: '/superadmin/templates', icon: Mail },
      ],
    },
    settings: {
      title: 'Configurações',
      icon: Settings,
      items: [
        { title: 'Planos e Preços', href: '/superadmin/plans', icon: Settings },
      ],
    },
    support: {
      title: 'Suporte',
      icon: Headphones,
      items: [
        { 
          title: 'Tickets de Suporte', 
          href: '/superadmin/support', 
          icon: Headphones,
          badge: ticketStats?.open,
        },
      ],
    },
    audit: {
      title: 'Auditoria',
      icon: ScrollText,
      items: [
        { title: 'Logs de Auditoria', href: '/superadmin/logs', icon: ScrollText },
      ],
    },
  };

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Super Admin</h2>
            <p className="text-xs text-muted-foreground">Na Régua Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {Object.entries(menuGroups).map(([key, group]) => (
            <Collapsible
              key={key}
              open={openGroups.includes(key)}
              onOpenChange={() => toggleGroup(key)}
            >
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  <div className="flex items-center gap-2">
                    <group.icon className="h-4 w-4" />
                    <span>{group.title}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      openGroups.includes(key) && 'rotate-180'
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-0">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.title}</span>
                      </div>
                      {item.badge && item.badge > 0 && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'h-5 min-w-[20px] px-1.5 text-xs',
                            isActive
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-destructive/10 text-destructive'
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export { SuperAdminSidebar };
