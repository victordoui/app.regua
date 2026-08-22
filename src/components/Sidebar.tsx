import { useMemo, useState, useEffect } from "react";
import vizzuLogo from "@/assets/vizzu-logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useSidebarCollapsed, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "@/hooks/useSidebarCollapsed";
import { useSuperAdminBadges } from "@/hooks/superadmin/useSuperAdminBadges";
import { useHasOwnBusiness } from "@/hooks/useHasOwnBusiness";
import {
  Home, BarChart3,
  Calendar, Users, Briefcase, Package,
  MessageSquare,
  CreditCard, Receipt,
  Crown, Heart,
  Building, UserCircle, UserCheck,
  ShoppingCart, Tag,
  Shield, LogOut, Sparkles,
  ChevronDown, Settings, Moon, Sun,
  LayoutDashboard, Wallet, Megaphone,
  HeartHandshake, TrendingUp,
  DollarSign, CalendarClock, Ticket, Send, Mail,
  Headphones, ScrollText, ArrowLeft,
} from "lucide-react";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const BARBER_PATHS = new Set([
  '/', '/appointments', '/clients', '/conversations', '/profile'
]);
const BARBER_CATEGORIES = new Set(['home', 'analytics', 'negocio', 'operacoes', 'comunicacao']);


const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isAdmin, isBarbeiro } = useRole();
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const { collapsed } = useSidebarCollapsed();

  const inPlatformContext = isSuperAdmin && location.pathname.startsWith('/superadmin');
  const { openTickets, expiring7Days } = useSuperAdminBadges(inPlatformContext);
  const { hasOwnBusiness } = useHasOwnBusiness();

  // Super admins sem negócio próprio não devem cair num painel vazio.
  const contextSwitchLabel = inPlatformContext
    ? (hasOwnBusiness ? 'Voltar ao meu negócio' : 'Sair da plataforma')
    : 'Painel da Plataforma';

  const handleContextSwitch = () => {
    if (!inPlatformContext) {
      navigate('/superadmin');
      return;
    }
    navigate(hasOwnBusiness ? '/' : '/profile');
  };


  const platformMenuStructure = useMemo(() => [
    {
      category: "plat-overview", label: "Visão Geral", icon: LayoutDashboard, section: "Início",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/superadmin" },
        { icon: Users, label: "Usuários do Sistema", path: "/superadmin/users" },
        { icon: DollarSign, label: "Métricas Financeiras", path: "/superadmin/metrics" },
      ]
    },
    {
      category: "plat-subscribers", label: "Assinantes", icon: Users, section: "Operação",
      items: [
        { icon: Users, label: "Assinantes", path: "/superadmin/subscribers" },
        { icon: CalendarClock, label: "Expirando", path: "/superadmin/expiring", badge: expiring7Days },
        { icon: CreditCard, label: "Pagamentos", path: "/superadmin/payments" },
      ]
    },
    {
      category: "plat-marketing", label: "Marketing", icon: Send, section: "Relacionamento",
      items: [
        { icon: Ticket, label: "Cupons da Plataforma", path: "/superadmin/coupons" },
        { icon: Send, label: "Mensagens em Massa", path: "/superadmin/broadcast" },
        { icon: Mail, label: "Templates de Email", path: "/superadmin/templates" },
      ]
    },
    {
      category: "plat-settings", label: "Planos e Preços", icon: Settings, section: "Gestão",
      items: [
        { icon: Settings, label: "Planos e Preços", path: "/superadmin/plans" },
      ]
    },
    {
      category: "plat-support", label: "Suporte", icon: Headphones, section: "Atendimento",
      items: [
        { icon: Headphones, label: "Tickets de Suporte", path: "/superadmin/support", badge: openTickets },
      ]
    },
    {
      category: "plat-audit", label: "Auditoria", icon: ScrollText, section: "Controle",
      items: [
        { icon: ScrollText, label: "Logs de Auditoria", path: "/superadmin/logs" },
      ]
    },
  ], [openTickets, expiring7Days]);


  const fullMenuStructure = useMemo(() => [
    {
      category: "home", label: "Início", icon: Home, section: "Início",
      items: [
        { icon: Home, label: "Visão Geral", path: "/" },
      ]
    },
    {
      category: "analytics", label: "Análises", icon: LayoutDashboard, section: "Análise",
      items: [
        { icon: TrendingUp, label: "Desempenho", path: "/dashboard/desempenho" },
        { icon: HeartHandshake, label: "Sucesso do Cliente", path: "/dashboard/sucesso-cliente" },
      ]
    },
    {
      category: "negocio", label: "Meu Negócio", icon: Building, section: "Gestão",
      items: [
        { icon: Building, label: "Minha Empresa", path: "/settings/company" },
        { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
        { icon: UserCheck, label: "Usuários", path: "/users" },
      ]
    },
    {
      category: "operacoes", label: "Operações", icon: Calendar, section: "Operação",
      items: [
        { icon: Calendar, label: "Agenda", path: "/appointments" },
        { icon: Users, label: "Clientes", path: "/clients" },
        { icon: Briefcase, label: "Profissionais", path: "/barbers" },
        { icon: Package, label: "Serviços", path: "/services" },
      ]
    },
    {
      category: "comunicacao", label: "Comunicação", icon: Megaphone, section: "Relacionamento",
      items: [
        { icon: MessageSquare, label: "Conversas", path: "/conversations" },
      ]
    },
    {
      category: "engajamento", label: "Engajamento", icon: Heart, section: "Relacionamento",
      items: [
        { icon: Crown, label: "Planos", path: "/subscriptions" },
        { icon: Heart, label: "Rewards", path: "/loyalty" },
      ]
    },
    {
      category: "financeiro", label: "Financeiro", icon: Wallet, section: "Financeiro",
      items: [
        { icon: BarChart3, label: "Insights", path: "/reports" },
        { icon: CreditCard, label: "Contas", path: "/billing" },
        { icon: Receipt, label: "Comissões", path: "/commissions" },
        { icon: Tag, label: "Promoções", path: "/coupons" },
        { icon: ShoppingCart, label: "Caixa / PDV", path: "/cash" },
      ]
    },
  ], []);

  const menuStructure = useMemo(() => {
    if (inPlatformContext) return platformMenuStructure;
    if (isSuperAdmin || isAdmin) return fullMenuStructure;
    if (isBarbeiro) {
      return fullMenuStructure
        .filter(cat => BARBER_CATEGORIES.has(cat.category))
        .map(cat => ({ ...cat, items: cat.items.filter(item => BARBER_PATHS.has(item.path)) }))
        .filter(cat => cat.items.length > 0);
    }
    return [];
  }, [fullMenuStructure, platformMenuStructure, inPlatformContext, isSuperAdmin, isAdmin, isBarbeiro]);

  const isActivePath = (path: string) => {
    if (location.pathname === path) return true;
    // Rotas raiz não devem capturar sub-rotas de outras seções.
    if (path === '/') return false;
    if (path === '/superadmin') return false;
    return location.pathname.startsWith(`${path}/`);
  };
  const isCategoryActive = (items: { path: string }[]) =>
    items.some(i => isActivePath(i.path));


  const [openCategories, setOpenCategories] = useState<string[]>(() => {
    const active = menuStructure.find(cat => cat.items.some(i => isActivePath(i.path)));
    return active ? [active.category] : [];
  });

  useEffect(() => {
    const active = menuStructure.find(cat => cat.items.some(i => isActivePath(i.path)));
    if (active) {
      setOpenCategories(prev => prev.includes(active.category) ? prev : [...prev, active.category]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, menuStructure]);

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isAdmin) return 'Administrador';
    if (isBarbeiro) return 'Profissional';
    return 'Usuário';
  };

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'VZ';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getUserName = () =>
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const handleSignOut = async () => {
    try {
      await signOut?.();
    } catch (error) {
      console.error("Erro ao encerrar a sessão:", error);
    }
    navigate('/login');
  };

  return (
    <aside
      className="fixed bottom-0 left-0 top-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[8px_0_28px_-24px_rgba(2,20,45,0.7)] transition-[width] duration-200 md:flex"
      style={{ width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED }}
    >
      {/* Toggle agora vive na Topbar */}

      {/* Brand */}
      <div className={`flex shrink-0 items-center justify-center ${collapsed ? 'h-[76px] px-2' : 'h-[138px] px-4'}`}>
        <img
          src={vizzuLogo}
          alt="VIZZU"
          className={`object-contain transition-all duration-200 ${collapsed ? 'h-11 w-11' : 'h-[112px] w-[142px]'}`}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-px overflow-y-auto px-2.5 pb-3 scrollbar-hidden-hover">
        {menuStructure.map((category, categoryIndex) => {
          const CatIcon = category.icon;
          const isOpen = openCategories.includes(category.category);
          const hasActive = isCategoryActive(category.items);
          const isSingle = category.items.length === 1;
          const showSection = !collapsed && category.section !== 'Início' && (categoryIndex === 0 || menuStructure[categoryIndex - 1]?.section !== category.section);
          const sectionLabel = showSection ? (
            <div className="flex items-center gap-2 px-2 pb-0.5 pt-2.5">
              <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.15em] text-white/65">{category.section}</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
          ) : null;
          const moduleClass = categoryIndex > 0
            ? (showSection ? "mt-1.5" : "mt-1.5 border-t border-white/10 pt-1.5")
            : undefined;
          // Categoria com 1 item → link direto
          if (isSingle) {
            const item = category.items[0];
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <div key={category.category} className={moduleClass}>
                {sectionLabel}
                <button
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl text-[14px] font-bold transition-all duration-150 ${
                    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                  } ${
                    active
                      ? 'bg-white text-[hsl(var(--sidebar-background))] shadow-sm'
                      : 'text-white/90 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{category.label}</span>}
                </button>
              </div>
            );
          }

          // Modo colapsado: categoria vira botão único → primeiro item
          if (collapsed) {
            return (
              <button
                key={category.category}
                onClick={() => navigate(category.items[0].path)}
                title={category.label}
                className={`flex w-full items-center justify-center rounded-xl px-2 py-2.5 transition-colors ${
                  hasActive
                    ? 'bg-white text-[hsl(var(--sidebar-background))] shadow-sm'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <CatIcon className="h-5 w-5 flex-shrink-0" />
              </button>
            );
          }

          return (
            <div key={category.category} className={moduleClass}>
              {sectionLabel}
              <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.category)}>
                <CollapsibleTrigger asChild>
                  <button
                    className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-0 text-[14px] font-bold transition-all duration-150 ${
                      hasActive && isOpen
                        ? 'bg-white/[0.09] text-white shadow-inner shadow-white/[0.03]'
                        : 'text-white/90 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    <CatIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate flex-1 text-left">{category.label}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 opacity-80 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-px space-y-px pl-3">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActivePath(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`relative flex min-h-8 w-full items-center gap-2.5 rounded-md px-3 py-0.5 text-[13px] font-semibold transition-all duration-150 ${
                          active
                            ? 'bg-white font-semibold text-[hsl(var(--sidebar-background))] shadow-sm'
                            : 'text-white/78 hover:bg-white/[0.07] hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 opacity-90" />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`ml-auto min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            active
                              ? 'bg-[hsl(var(--sidebar-background))] text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}

        {/* Troca de contexto (Super Admin) */}
        {isSuperAdmin && (
          <div className="mt-2 border-t border-white/10 pt-2">
            <button
              onClick={handleContextSwitch}
              title={collapsed ? contextSwitchLabel : undefined}
              className={`w-full flex items-center gap-3 rounded-md text-[14px] font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
              }`}
            >
              {inPlatformContext
                ? <ArrowLeft className="h-5 w-5 flex-shrink-0" />
                : <Shield className="h-5 w-5 flex-shrink-0" />}
              {!collapsed && <span className="truncate">{contextSwitchLabel}</span>}
            </button>
          </div>
        )}

      </nav>

      {/* Footer */}
      <div className={`shrink-0 space-y-2 border-t border-white/10 bg-black/[0.04] p-2.5 ${collapsed ? 'px-2' : ''}`}>
        {!inPlatformContext && (
          <button
            onClick={() => navigate('/upgrade')}
            title={collapsed ? 'Fazer Upgrade' : undefined}
            className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-white/20 text-sm font-semibold text-white transition-all hover:bg-white/10 ${
              collapsed ? 'px-0' : ''
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {!collapsed && 'Fazer Upgrade'}
          </button>
        )}


        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title={collapsed ? getUserName() : undefined}
            className={`group flex w-full items-center gap-2.5 rounded-xl bg-white/[0.07] p-2 transition-colors hover:bg-white/[0.12] ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[12px] font-bold text-primary-foreground flex-shrink-0">
                {getUserInitials()}
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-[15px] font-semibold text-white truncate">{getUserName()}</div>
                    <div className="text-xs text-sidebar-foreground/70 truncate">{getRoleLabel()}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-white" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel className="font-semibold">{getUserName()}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <UserCircle className="h-4 w-4 mr-2" /> Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/company')}>
              <Settings className="h-4 w-4 mr-2" /> Minha Empresa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/upgrade')}>
              <Sparkles className="h-4 w-4 mr-2" /> Fazer Upgrade
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              {resolvedTheme === 'dark'
                ? (<><Sun className="h-4 w-4 mr-2" /> Tema claro</>)
                : (<><Moon className="h-4 w-4 mr-2" /> Tema escuro</>)}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

export default Sidebar;
