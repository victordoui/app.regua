import { useMemo, useState, useEffect } from "react";
import vizzuLogo from "@/assets/vizzu-logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
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
const BARBER_CATEGORIES = new Set(['operacoes', 'comunicacao', 'administracao']);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isAdmin, isBarbeiro } = useRole();
  const { user, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const fullMenuStructure = [
    {
      category: "dashboard", label: "Dashboard", icon: LayoutDashboard,
      items: [
        { icon: Home, label: "Painel", path: "/" },
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
  ];

  const menuStructure = useMemo(() => {
    if (isSuperAdmin || isAdmin) return fullMenuStructure;
    if (isBarbeiro) {
      return fullMenuStructure
        .filter(cat => BARBER_CATEGORIES.has(cat.category))
        .map(cat => ({ ...cat, items: cat.items.filter(item => BARBER_PATHS.has(item.path)) }))
        .filter(cat => cat.items.length > 0);
    }
    return [];
  }, [isSuperAdmin, isAdmin, isBarbeiro]);

  const isActivePath = (path: string) => location.pathname === path;
  const isCategoryActive = (items: { path: string }[]) =>
    items.some(i => isActivePath(i.path));

  // Categorias abertas — começa abrindo a que contém a rota ativa
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  useEffect(() => {
    const active = menuStructure.find(cat => isCategoryActive(cat.items));
    if (active && !openCategories.includes(active.category)) {
      setOpenCategories(prev => [...prev, active.category]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, menuStructure.length]);

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
    try { await signOut?.(); } catch {}
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-[234px] flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border max-md:hidden">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-center border-b border-sidebar-border">
        <img src={vizzuLogo} alt="VIZZU" className="h-20 w-20 object-contain brightness-0 invert" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-hidden-hover">
        {menuStructure.map((category, idx) => {
          const CatIcon = category.icon;
          const isOpen = openCategories.includes(category.category);
          const hasActive = isCategoryActive(category.items);
          const isSingle = category.items.length === 1;

          // Categorias com 1 único item viram link direto
          if (isSingle) {
            const item = category.items[0];
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <div key={category.category} className={idx > 0 ? "mt-1 pt-1 border-t border-sidebar-border/60" : ""}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-semibold transition-colors
                    ${active
                      ? 'bg-sidebar-accent text-white'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white'}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              </div>
            );
          }

          return (
            <div key={category.category} className={idx > 0 ? "mt-1 pt-1 border-t border-sidebar-border/60" : ""}>
              <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.category)}>
                <CollapsibleTrigger asChild>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-semibold transition-colors
                      ${hasActive
                        ? 'text-white'
                        : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-white'}`}
                  >
                    <CatIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate flex-1 text-left">{category.label}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 opacity-70 ${isOpen ? 'rotate-180' : ''}`} />
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
                        className={`w-full flex items-center gap-3 pl-9 pr-3 py-2 rounded-md text-[13px] font-medium transition-colors relative
                          ${active
                            ? 'bg-sidebar-accent text-white'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white'}`}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0 opacity-90" />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold bg-orange-500 text-white">
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
          <div className="mt-2 pt-2 border-t border-amber-500/20">
            <button
              onClick={() => navigate('/superadmin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-semibold text-amber-400 hover:bg-amber-500/10 transition-all
                ${isActivePath('/superadmin') ? 'bg-amber-500/10' : ''}`}
            >
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span>Super Admin</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <button
          onClick={() => navigate('/upgrade')}
          className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md border border-white/20 text-white text-xs font-semibold hover:bg-white/10 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Fazer Upgrade
        </button>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-sidebar-accent/60 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[11px] font-bold text-primary-foreground flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-xs font-semibold text-white truncate">{getUserName()}</div>
                <div className="text-[10px] text-sidebar-foreground/60 truncate">{getRoleLabel()}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/60 group-hover:text-white" />
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
