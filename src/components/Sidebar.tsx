import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/contexts/RoleContext";
import vizzuIcon from "@/assets/vizzu-icon.png";
import { useTheme } from "next-themes";
import { 
  Home, BarChart3, TrendingUp, Target,
  Calendar, Users, Briefcase, Package,
  MessageSquare, Bell, Megaphone,
  DollarSign, CreditCard, Ticket, Receipt,
  Crown, Heart,
  Building, Image, Warehouse, Plug,
  Settings, Shield, Star, ListOrdered, UserCheck, UserCircle,
  ShoppingCart, Gift, Clock, MessageCircle, Tag,
  Menu, X, LogOut, ChevronsLeft, ChevronsRight
} from "lucide-react";

const BARBER_PATHS = new Set([
  '/', '/appointments', '/clients', '/conversations',
  '/advanced-notifications', '/team-chat', '/shifts', '/profile'
]);

const BARBER_CATEGORIES = new Set(['operacoes', 'comunicacao', 'administracao']);

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isAdmin, isBarbeiro } = useRole();
  const { resolvedTheme } = useTheme();

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
        { icon: Home, label: "Painel", path: "/" }
      ]
    },
    {
      category: "operacoes", label: "Operações",
      items: [
        { icon: Calendar, label: "Agenda", path: "/appointments" },
        { icon: Users, label: "Clientes", path: "/clients" },
        { icon: Briefcase, label: "Profissionais", path: "/barbers" },
        { icon: Package, label: "Serviços", path: "/services" },
        { icon: ListOrdered, label: "Lista de Espera", path: "/waitlist" },
        { icon: Clock, label: "Turnos", path: "/shifts" }
      ]
    },
    {
      category: "comunicacao", label: "Comunicação",
      items: [
        { icon: MessageSquare, label: "Conversas", path: "/conversations" },
        { icon: Bell, label: "Notificações", path: "/advanced-notifications" },
        { icon: MessageCircle, label: "Chat Equipe", path: "/team-chat" }
      ]
    },
    {
      category: "financeiro", label: "Financeiro",
      items: [
        { icon: BarChart3, label: "Insights", path: "/reports" },
        { icon: CreditCard, label: "Contas", path: "/billing" },
        { icon: Receipt, label: "Comissões", path: "/commissions" },
        { icon: Ticket, label: "Cupons", path: "/coupons" },
        { icon: Gift, label: "Gift Cards", path: "/gift-cards" },
        { icon: Tag, label: "Preços Dinâmicos", path: "/dynamic-pricing" },
        { icon: ShoppingCart, label: "Caixa / PDV", path: "/cash" }
      ]
    },
    {
      category: "assinaturas", label: "Engajamento",
      items: [
        { icon: Crown, label: "Planos", path: "/subscriptions" },
        { icon: Heart, label: "Rewards", path: "/loyalty" }
      ]
    },
    {
      category: "empresa", label: "Meu Negócio",
      items: [
        { icon: Building, label: "Empresa", path: "/settings/company" },
        { icon: Warehouse, label: "Estoque", path: "/inventory" },
        { icon: Image, label: "Galeria", path: "/gallery" }
      ]
    },
    {
      category: "administracao", label: "Administração",
      items: [
        { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
        { icon: UserCheck, label: "Usuários", path: "/users" }
      ]
    }
  ];

  const menuStructure = useMemo(() => {
    if (isSuperAdmin || isAdmin) return fullMenuStructure;
    if (isBarbeiro) {
      return fullMenuStructure
        .filter(cat => BARBER_CATEGORIES.has(cat.category))
        .map(cat => ({
          ...cat,
          items: cat.items.filter(item => BARBER_PATHS.has(item.path))
        }))
        .filter(cat => cat.items.length > 0);
    }
    return [];
  }, [isSuperAdmin, isAdmin, isBarbeiro]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleSignOut = () => {
    navigate("/login");
  };

  const isActivePath = (path: string) => location.pathname === path;

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isAdmin) return 'Administrador';
    if (isBarbeiro) return 'Profissional';
    return 'Usuário';
  };

  const sidebarWidth = isCollapsed ? 68 : 240;

  return (
    <>
      {isMobile && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="fixed top-4 left-4 z-50">
          <Button
            variant="ghost" size="icon"
            className="bg-background/80 backdrop-blur-sm border shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </motion.div>
      )}

      <motion.div
        initial={false}
        animate={{ width: sidebarWidth, x: isMobile && !isOpen ? -240 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full z-40 flex flex-col border-r border-border/50
          bg-card dark:bg-gradient-to-b dark:from-[hsl(var(--primary-950))] dark:to-[hsl(var(--primary-900))]
          ${isMobile ? 'shadow-2xl' : 'md:relative md:shadow-none'}`}
        style={{ width: isMobile ? (isOpen ? 240 : 0) : sidebarWidth }}
      >
        {/* Header - Logo */}
        <div className={`flex items-center border-b border-border/30 ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3 gap-3'}`}>
          <div className={`flex-shrink-0 ${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'}`}>
            <img src={vizzuIcon} alt="VIZZU" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-foreground dark:text-white tracking-tight">VIZZU</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {menuStructure.map((category) => (
            <div key={category.category} className="mb-1">
              {/* Section Label */}
              {!isCollapsed && (
                <div className="px-3 pt-4 pb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 dark:text-white/30">
                    {category.label}
                  </span>
                </div>
              )}
              {isCollapsed && <div className="my-2 mx-2 border-t border-border/20" />}

              {/* Menu Items */}
              {category.items.map((menuItem) => {
                const isActive = isActivePath(menuItem.path);
                return (
                  <button
                    key={menuItem.path}
                    onClick={() => handleNavigation(menuItem.path)}
                    className={`w-full flex items-center gap-3 rounded-lg transition-all duration-150 group relative
                      ${isCollapsed ? 'justify-center px-2 py-2.5 mx-auto' : 'px-3 py-2'}
                      ${isActive
                        ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white/90'
                      }`}
                  >
                    {/* Active indicator bar */}
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary dark:bg-white" />
                    )}
                    <menuItem.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`} />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{menuItem.label}</span>
                    )}
                    {menuItem.path === "/appointments" && !isCollapsed && (
                      <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5 bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                        12
                      </Badge>
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
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-amber-500 hover:bg-amber-500/10 transition-all
                  ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">Super Admin</span>}
              </button>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className={`border-t border-border/30 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {!isCollapsed && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all mb-2 dark:text-white/50 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          )}

          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary-foreground">VZ</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground dark:text-white truncate">VIZZU</p>
                  <p className="text-[10px] text-muted-foreground dark:text-white/40 truncate">{getRoleLabel()}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground dark:text-white/40 dark:hover:text-white"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expandir" : "Colapsar"}
            >
              {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </motion.div>

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
