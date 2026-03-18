import { useMemo } from "react";
import vizzuLogo from "@/assets/vizzu-logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home, BarChart3,
  Calendar, Users, Briefcase, Package,
  MessageSquare,
  CreditCard, Receipt,
  Crown, Heart,
  Building, UserCircle, UserCheck,
  ShoppingCart, Tag,
  Shield, LogOut,
  Menu, X, Sparkles
} from "lucide-react";

const BARBER_PATHS = new Set([
  '/', '/appointments', '/clients', '/conversations', '/profile'
]);
const BARBER_CATEGORIES = new Set(['operacoes', 'comunicacao', 'administracao']);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isAdmin, isBarbeiro } = useRole();
  const { user } = useAuth();

  const fullMenuStructure = [
    {
      category: "dashboard", label: "Dashboard",
      items: [
        { icon: Home, label: "Painel", path: "/" },
      ]
    },
    {
      category: "negocio", label: "Meu Negócio",
      items: [
        { icon: Building, label: "Minha Empresa", path: "/settings/company" },
        { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
        { icon: UserCheck, label: "Usuários", path: "/users" },
      ]
    },
    {
      category: "operacoes", label: "Operações",
      items: [
        { icon: Calendar, label: "Agenda", path: "/appointments", badge: 8 },
        { icon: Users, label: "Clientes", path: "/clients" },
        { icon: Briefcase, label: "Profissionais", path: "/barbers" },
        { icon: Package, label: "Serviços", path: "/services" },
      ]
    },
    {
      category: "comunicacao", label: "Comunicação",
      items: [
        { icon: MessageSquare, label: "Conversas", path: "/conversations" },
      ]
    },
    {
      category: "financeiro", label: "Financeiro",
      items: [
        { icon: BarChart3, label: "Insights", path: "/reports" },
        { icon: CreditCard, label: "Contas", path: "/billing" },
        { icon: Receipt, label: "Comissões", path: "/commissions" },
        { icon: Tag, label: "Promoções", path: "/coupons" },
        { icon: ShoppingCart, label: "Caixa / PDV", path: "/cash" },
      ]
    },
    {
      category: "engajamento", label: "Engajamento",
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

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActivePath = (path: string) => location.pathname === path;

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

  const getUserName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <>
      {/* Sidebar — desktop only (mobile uses MobileBottomNav via Layout) */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-[234px] flex flex-col bg-card border-r border-border max-md:hidden">
        {/* Brand */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-center border-b border-border">
          <img src={vizzuLogo} alt="VIZZU" className="h-20 w-20 object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hidden-hover">
          {menuStructure.map((category) => (
            <div key={category.category} className="mb-4">
              {/* Section label — clean, no divider */}
              <div className="px-3 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-[1.2px] text-primary/60">
                  {category.label}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-0.5">
                {category.items.map((item) => {
                  const isActive = isActivePath(item.path);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 relative
                        ${isActive
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-60'}`} />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                          ${isActive ? 'bg-primary-foreground/25 text-primary-foreground' : 'bg-orange-400 text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Super Admin */}
          {isSuperAdmin && (
            <div className="mt-2 pt-2 border-t border-amber-500/20">
              <button
                onClick={() => handleNavigation('/superadmin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-amber-500 hover:bg-amber-500/10 transition-all
                  ${isActivePath('/superadmin') ? 'bg-amber-500/10' : ''}`}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span>Super Admin</span>
              </button>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-2">
          {/* Compact upgrade button */}
          <button
            onClick={() => handleNavigation('/upgrade')}
            className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Fazer Upgrade
          </button>

          {/* User row */}
          <div className="flex items-center gap-2 px-0.5 py-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-[11px] font-bold text-primary-foreground flex-shrink-0">
              {getUserInitials()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-foreground truncate">{getUserName()}</div>
              <div className="text-[10px] text-muted-foreground truncate">{getRoleLabel()}</div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              aria-label="Sair"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

    </>
  );
};

export default Sidebar;
