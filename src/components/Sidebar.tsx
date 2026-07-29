import { useMemo, useState, useEffect } from "react";
import vizzuLogo from "@/assets/vizzu-logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useSidebarCollapsed, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "@/hooks/useSidebarCollapsed";
import { useSuperAdminBadges } from "@/hooks/superadmin/useSuperAdminBadges";
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
const BARBER_CATEGORIES = new Set(['dashboard', 'operacoes', 'comunicacao', 'administracao']);


const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isAdmin, isBarbeiro } = useRole();
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const { collapsed } = useSidebarCollapsed();

  const fullMenuStructure = useMemo(() => [
    {
      category: "dashboard", label: "Dashboard", icon: LayoutDashboard,
      items: [
        { icon: Home, label: "Visão Geral", path: "/" },
        { icon: TrendingUp, label: "Desempenho", path: "/dashboard/desempenho" },
        { icon: HeartHandshake, label: "Sucesso do Cliente", path: "/dashboard/sucesso-cliente" },
      ]
    },
    {
      category: "negocio", label: "Meu Negócio", icon: Building,
      items: [
        { icon: Building, label: "Minha Empresa", path: "/settings/company" },
        { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
        { icon: UserCheck, label: "Usuários", path: "/users" },
      ]
    },
    {
      category: "operacoes", label: "Operações", icon: Calendar,
      items: [
        { icon: Calendar, label: "Agenda", path: "/appointments", badge: 8 },
        { icon: Users, label: "Clientes", path: "/clients" },
        { icon: Briefcase, label: "Profissionais", path: "/barbers" },
        { icon: Package, label: "Serviços", path: "/services" },
      ]
    },
    {
      category: "comunicacao", label: "Comunicação", icon: Megaphone,
      items: [
        { icon: MessageSquare, label: "Conversas", path: "/conversations" },
      ]
    },
    {
      category: "financeiro", label: "Financeiro", icon: Wallet,
      items: [
        { icon: BarChart3, label: "Insights", path: "/reports" },
        { icon: CreditCard, label: "Contas", path: "/billing" },
        { icon: Receipt, label: "Comissões", path: "/commissions" },
        { icon: Tag, label: "Promoções", path: "/coupons" },
        { icon: ShoppingCart, label: "Caixa / PDV", path: "/cash" },
      ]
    },
    {
      category: "engajamento", label: "Engajamento", icon: Heart,
      items: [
        { icon: Crown, label: "Planos", path: "/subscriptions" },
        { icon: Heart, label: "Rewards", path: "/loyalty" },
      ]
    },
  ], []);

  const menuStructure = useMemo(() => {
    if (isSuperAdmin || isAdmin) return fullMenuStructure;
    if (isBarbeiro) {
      return fullMenuStructure
        .filter(cat => BARBER_CATEGORIES.has(cat.category))
        .map(cat => ({ ...cat, items: cat.items.filter(item => BARBER_PATHS.has(item.path)) }))
        .filter(cat => cat.items.length > 0);
    }
    return [];
  }, [fullMenuStructure, isSuperAdmin, isAdmin, isBarbeiro]);

  const isActivePath = (path: string) => location.pathname === path;
  const isCategoryActive = (items: { path: string }[]) =>
    items.some(i => isActivePath(i.path));

  const [openCategories, setOpenCategories] = useState<string[]>(() => {
    const active = menuStructure.find(cat => cat.items.some(i => location.pathname === i.path));
    return active ? [active.category] : [];
  });

  useEffect(() => {
    const active = menuStructure.find(cat => cat.items.some(i => i.path === location.pathname));
    if (active) {
      setOpenCategories(prev => prev.includes(active.category) ? prev : [...prev, active.category]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
      className="fixed bottom-0 left-0 top-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex"
      style={{ width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED }}
    >
      {/* Toggle agora vive na Topbar */}

      {/* Brand */}
      <div className={`flex items-center justify-center ${collapsed ? 'px-2 pb-2 pt-3' : 'px-4 pb-2 pt-3'}`}>
        <img
          src={vizzuLogo}
          alt="VIZZU"
          className={`object-contain transition-all duration-200 ${collapsed ? 'h-10 w-10' : 'h-36 w-36'}`}
        />
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-0.5 overflow-y-auto px-2 py-3 scrollbar-hidden-hover`}>
        {menuStructure.map((category) => {
          const CatIcon = category.icon;
          const isOpen = openCategories.includes(category.category);
          const hasActive = isCategoryActive(category.items);
          const isSingle = category.items.length === 1;

          // Categoria com 1 item → link direto
          if (isSingle) {
            const item = category.items[0];
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <div key={category.category}>
                <button
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 rounded-md text-[15px] font-semibold transition-colors ${
                    collapsed ? 'justify-center px-2 py-3' : 'px-3 py-3'
                  } ${
                    active
                      ? 'bg-white text-[hsl(var(--sidebar-background))] shadow-sm'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
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
                className={`w-full flex items-center justify-center px-2 py-3 rounded-md transition-colors ${
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
            <div key={category.category}>
              <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.category)}>
                <CollapsibleTrigger asChild>
                  <button
                    className={`w-full flex items-center gap-3 rounded-md px-3 py-3 text-[15px] font-semibold transition-colors ${
                      hasActive && isOpen
                        ? 'bg-white/10 text-white'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <CatIcon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate flex-1 text-left">{category.label}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 opacity-80 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-0.5 space-y-0.5">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActivePath(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`relative flex w-full items-center gap-3 rounded-md py-2.5 pl-10 pr-3 text-[14px] font-medium transition-colors ${
                          active
                            ? 'bg-white font-semibold text-[hsl(var(--sidebar-background))] shadow-sm'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] flex-shrink-0 opacity-90" />
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

        {/* Super Admin */}
        {isSuperAdmin && (
          <div className="mt-2 pt-2">
            <button
              onClick={() => navigate('/superadmin')}
              title={collapsed ? 'Super Admin' : undefined}
              className={`w-full flex items-center gap-3 rounded-md text-[14px] font-semibold text-amber-400 hover:bg-amber-500/10 transition-all ${
                collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
              } ${isActivePath('/superadmin') ? 'bg-amber-500/10' : ''}`}
            >
              <Shield className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Super Admin</span>}
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={`space-y-2.5 border-t border-sidebar-border p-3 ${collapsed ? 'px-2' : ''}`}>
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

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title={collapsed ? getUserName() : undefined}
              className={`group flex w-full items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-white/10 ${
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
