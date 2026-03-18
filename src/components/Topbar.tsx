import { Bell, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard Analítico', subtitle: 'Visão geral de performance e métricas do sistema' },
  '/appointments': { title: 'Agenda', subtitle: 'Gerencie seus agendamentos' },
  '/clients': { title: 'Clientes', subtitle: 'Base de clientes do seu negócio' },
  '/settings/company': { title: 'Minha Empresa', subtitle: 'Configure seu estabelecimento' },
  '/services': { title: 'Serviços', subtitle: 'Catálogo de serviços oferecidos' },
  '/reports': { title: 'Insights', subtitle: 'Relatórios e análises financeiras' },
  '/billing': { title: 'Contas', subtitle: 'Gestão financeira e pagamentos' },
  '/commissions': { title: 'Comissões', subtitle: 'Comissões dos profissionais' },
  '/coupons': { title: 'Promoções', subtitle: 'Cupons e ofertas especiais' },
  '/cash': { title: 'Caixa / PDV', subtitle: 'Controle de caixa e vendas' },
  '/barbers': { title: 'Profissionais', subtitle: 'Equipe do seu negócio' },
  '/conversations': { title: 'Conversas', subtitle: 'Mensagens e comunicação' },
  '/subscriptions': { title: 'Planos', subtitle: 'Gestão de assinaturas' },
  '/loyalty': { title: 'Rewards', subtitle: 'Programa de fidelidade' },
  '/profile': { title: 'Meu Perfil', subtitle: 'Suas informações pessoais' },
  '/users': { title: 'Usuários', subtitle: 'Gestão de usuários do sistema' },
  '/upgrade': { title: 'Upgrade', subtitle: 'Evolua seu plano' },
  '/superadmin': { title: 'Super Admin', subtitle: 'Painel administrativo da plataforma' },
};

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

const Topbar = ({ title, subtitle }: TopbarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const routeInfo = ROUTE_TITLES[location.pathname] || { title: 'VIZZU', subtitle: 'Painel de gestão' };
  const displayTitle = title || routeInfo.title;
  const displaySubtitle = subtitle || routeInfo.subtitle;

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'VZ';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 right-0 left-[234px] z-30 h-14 bg-background border-b border-border flex items-center justify-between px-7 max-md:left-0">
      {/* Page title */}
      <div className="min-w-0">
        <h1 className="text-base font-bold text-foreground leading-tight truncate">{displayTitle}</h1>
        <p className="text-xs text-muted-foreground truncate">{displaySubtitle}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-4">
        <div className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(), "dd MMM, yyyy", { locale: ptBR })}
        </div>
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Notificações"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[11px] font-bold text-primary-foreground flex-shrink-0 shadow-sm">
          {getUserInitials()}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
