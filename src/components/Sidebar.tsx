import { useState, useEffect, useMemo } from "react";
import vizzuLogo from "@/assets/vizzu-logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
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
  Shield, Search, LogOut,
  Menu, X, ChevronUp
} from "lucide-react";

const BARBER_PATHS = new Set([
  '/', '/appointments', '/clients', '/conversations', '/profile'
]);
const BARBER_CATEGORIES = new Set(['operacoes', 'comunicacao', 'administracao']);

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isAdmin, isBarbeiro } = useRole();
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const fullMenuStructure = [
    {
      category: "dashboard", label: "Dashboard",
      items: [
        { icon: Home, label: "Painel", path: "/" },
        { icon: Building, label: "Configurações", path: "/settings/company" },
      ]
    },
    {
      category: "negocio", label: "Meu Negócio",
      items: [
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
    setIsOpen(false);
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
      {/* Mobile toggle */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 w-10 h-10 rounded-[10px] bg-white border border-[hsl(var(--border))] shadow-lg flex items-center justify-center"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 w-[234px] flex flex-col bg-white border-r border-[hsl(var(--border))] transition-transform duration-250 ease-in-out
          ${isMobile ? (isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full') : 'translate-x-0'}`}
      >
        {/* Brand */}
        <div className="px-5 pt-[18px] pb-4 flex items-center justify-center border-b border-[hsl(var(--border))]">
          <img src={vizzuLogo} alt="VIZZU" className="h-32 w-32 object-contain" />
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-[10px] py-1 scrollbar-modern">
          {menuStructure.map((category) => (
            <div key={category.category} className="mb-5">
              {/* Section label */}
              <div className="flex items-center gap-2 px-[10px] mb-1">
                <span className="text-[9px] font-semibold uppercase tracking-[1.2px] text-muted-foreground whitespace-nowrap">
                  {category.label}
                </span>
                <div className="flex-1 h-px bg-[hsl(var(--border))]" />
              </div>

              {/* Items */}
              {category.items.map((item) => {
                const isActive = isActivePath(item.path);
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-[10px] px-[10px] py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 mb-px relative
                      ${isActive
                        ? 'bg-primary text-white font-semibold'
                        : 'text-muted-foreground hover:bg-[hsl(var(--primary-50))] hover:text-primary'
                      }`}
                  >
                    <Icon className={`h-[15px] w-[15px] flex-shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-45 group-hover:opacity-80'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto min-w-[20px] h-[18px] rounded-full px-[5px] flex items-center justify-center text-[10px] font-bold
                        ${isActive ? 'bg-white/25 text-white' : 'bg-primary text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Super Admin */}
          {isSuperAdmin && (
            <div className="mt-2 pt-2 border-t border-amber-500/20">
              <button
                onClick={() => handleNavigation('/superadmin')}
                className={`w-full flex items-center gap-[10px] px-[10px] py-2 rounded-lg text-[13px] font-medium text-amber-500 hover:bg-amber-500/10 transition-all
                  ${isActivePath('/superadmin') ? 'bg-amber-500/10' : ''}`}
              >
                <Shield className="h-[15px] w-[15px] flex-shrink-0" />
                <span>Super Admin</span>
              </button>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[hsl(var(--border))]">
          {/* Upgrade card */}
          <div className="bg-gradient-to-br from-[hsl(var(--primary-50))] to-[#EDE9FE] border border-[rgba(37,99,235,0.22)] rounded-[14px] p-3 mb-[10px]">
            <div className="font-heading text-xs font-bold text-foreground mb-0.5">Desbloqueie tudo</div>
            <div className="text-[10px] text-muted-foreground mb-[10px] leading-snug">
              Acesse relatórios avançados e integrações.
            </div>
            <button
              onClick={() => handleNavigation('/upgrade')}
              className="w-full bg-primary text-white border-none rounded-[7px] py-[7px] text-xs font-semibold cursor-pointer transition-all hover:bg-[hsl(var(--brand))] hover:-translate-y-px shadow-[0_3px_10px_rgba(37,99,235,0.16)]"
            >
              Fazer Upgrade
            </button>
          </div>

          {/* User row */}
          <div className="flex items-center gap-[9px] px-0.5 py-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--brand-light))] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-[0_2px_8px_rgba(37,99,235,0.16)]">
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

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
