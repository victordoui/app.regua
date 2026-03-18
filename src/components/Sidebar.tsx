import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/contexts/RoleContext";
import vizzuIcon from "@/assets/vizzu-icon.png";
import { 
  Home, BarChart3,
  Calendar, Users, Briefcase, Package,
  MessageSquare,
  CreditCard, Receipt,
  Crown, Heart,
  Building, UserCircle, UserCheck,
  ShoppingCart, Tag,
  Shield,
  Menu, X, LogOut, ChevronsLeft, ChevronsRight,
  Sparkles
} from "lucide-react";

const BARBER_PATHS = new Set([
  '/', '/appointments', '/clients', '/conversations', '/profile'
]);

const BARBER_CATEGORIES = new Set(['operacoes', 'comunicacao', 'administracao']);

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isAdmin, isBarbeiro } = useRole();

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
      category: "dashboard", label: "DASHBOARD",
      items: [{ icon: Home, label: "Painel", path: "/" }]
    },
    {
      category: "operacoes", label: "OPERAÇÕES",
      items: [
        { icon: Calendar, label: "Agenda", path: "/appointments", badge: 12 },
        { icon: Users, label: "Clientes", path: "/clients" },
        { icon: Briefcase, label: "Profissionais", path: "/barbers" },
        { icon: Package, label: "Serviços", path: "/services" }
      ]
    },
    {
      category: "comunicacao", label: "COMUNICAÇÃO",
      items: [
        { icon: MessageSquare, label: "Conversas", path: "/conversations" }
      ]
    },
    {
      category: "financeiro", label: "FINANCEIRO",
      items: [
        { icon: BarChart3, label: "Insights", path: "/reports" },
        { icon: CreditCard, label: "Contas", path: "/billing" },
        { icon: Receipt, label: "Comissões", path: "/commissions" },
        { icon: Tag, label: "Promoções", path: "/coupons" },
        { icon: ShoppingCart, label: "Caixa / PDV", path: "/cash" }
      ]
    },
    {
      category: "configuracoes", label: "GERAL",
      items: [
        { icon: Building, label: "Meu Negócio", path: "/settings/company" },
        { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
        { icon: UserCheck, label: "Usuários", path: "/users" }
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

  const handleSignOut = () => navigate("/login");
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
            className="bg-card/80 backdrop-blur-sm shadow-lg"
            style={{ border: '1px solid rgba(34,96,184,0.10)' }}
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
        className={`fixed left-0 top-0 h-full z-40 flex flex-col bg-card
          ${isMobile ? 'shadow-2xl' : 'md:relative md:shadow-none'}`}
        style={{
          width: isMobile ? (isOpen ? 240 : 0) : sidebarWidth,
          borderRight: '1px solid rgba(34,96,184,0.10)',
          boxShadow: isMobile ? undefined : '2px 0 20px rgba(34,96,184,0.06)',
        }}
      >
        {/* Header - Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3 gap-3'}`}
          style={{ borderBottom: '1px solid rgba(34,96,184,0.10)' }}>
          <div
            className={`flex-shrink-0 rounded-[10px] flex items-center justify-center ${isCollapsed ? 'w-9 h-9' : 'w-9 h-9'}`}
            style={{
              background: 'linear-gradient(135deg, #2260B8, #3A7FD8)',
              boxShadow: '0 4px 14px rgba(34,96,184,0.22)',
            }}
          >
            <span className="text-white font-montserrat font-extrabold text-sm">V</span>
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="font-montserrat font-extrabold text-lg text-primary tracking-[1.8px]">VIZZU</span>
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-primary"
                style={{
                  background: 'rgba(34,96,184,0.08)',
                  border: '1px solid rgba(34,96,184,0.20)',
                }}
              >PRO</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-1 px-2 scrollbar-modern">
          {menuStructure.map((category) => (
            <div key={category.category} className="mb-0.5">
              {!isCollapsed && (
                <div className="px-3 pt-3 pb-1 relative">
                  <span
                    className="font-open-sans text-[9px] font-semibold uppercase text-muted-foreground/50"
                    style={{ letterSpacing: '1.3px' }}
                  >
                    {category.label}
                  </span>
                  <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'rgba(34,96,184,0.07)' }} />
                </div>
              )}
              {isCollapsed && <div className="my-1 mx-2 border-t" style={{ borderColor: 'rgba(34,96,184,0.07)' }} />}

              {category.items.map((menuItem) => {
                const isActive = isActivePath(menuItem.path);
                return (
                  <button
                    key={menuItem.path}
                    onClick={() => handleNavigation(menuItem.path)}
                    className={`w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative
                      ${isCollapsed ? 'justify-center px-2 py-1.5 mx-auto' : 'px-3 py-[6px]'}`}
                    style={isActive ? {
                      background: 'rgba(34,96,184,0.14)',
                      color: '#2260B8',
                      fontWeight: 600,
                      boxShadow: 'inset 0 0 0 1px rgba(34,96,184,0.20)',
                    } : {
                      color: 'hsl(208, 35%, 37%)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'hsl(214, 100%, 95%)';
                        e.currentTarget.style.color = 'hsl(215, 60%, 15%)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'hsl(208, 35%, 37%)';
                      }
                    }}
                  >
                    <menuItem.icon
                      className="flex-shrink-0"
                      style={{
                        width: 15,
                        height: 15,
                        opacity: isActive ? 1 : 0.5,
                      }}
                    />
                    {!isCollapsed && (
                      <span className="text-[13px] truncate font-open-sans">{menuItem.label}</span>
                    )}
                    {'badge' in menuItem && menuItem.badge && !isCollapsed && (
                      <span
                        className="ml-auto text-[10px] font-semibold text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                        style={{
                          background: '#2260B8',
                          boxShadow: '0 2px 8px rgba(34,96,184,0.22)',
                        }}
                      >
                        {menuItem.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {isSuperAdmin && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(245, 158, 11, 0.20)' }}>
              <button
                onClick={() => handleNavigation('/superadmin')}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-amber-600 hover:bg-amber-500/10 transition-all
                  ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-semibold">Super Admin</span>}
              </button>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className={`${isCollapsed ? 'p-2' : 'p-3'}`} style={{ borderTop: '1px solid rgba(34,96,184,0.10)' }}>
          {/* Plan card */}
          {!isCollapsed && (
            <div
              className="rounded-xl p-3 mb-2"
              style={{
                background: 'linear-gradient(135deg, #F0F6FF, #EDF3FF)',
                border: '1px solid rgba(34,96,184,0.20)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-primary">Plano Básico</span>
              </div>
              <button
                className="w-full rounded-lg py-2 text-[12px] font-semibold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #2260B8, #3A7FD8)',
                  boxShadow: '0 3px 12px rgba(34,96,184,0.22)',
                }}
                onClick={() => handleNavigation('/upgrade')}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Fazer Upgrade
              </button>
            </div>
          )}

          {/* Sign out */}
          {!isCollapsed && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-open-sans transition-all"
              style={{ color: '#DC2626' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          )}

          {/* User row + collapse */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mt-1`}>
            {!isCollapsed && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #2260B8, #3A7FD8)',
                  }}
                >
                  <span className="text-[10px] font-montserrat font-bold text-white">VZ</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-montserrat font-semibold text-foreground truncate">VIZZU</p>
                  <p className="text-[10px] font-open-sans text-muted-foreground truncate">{getRoleLabel()}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
