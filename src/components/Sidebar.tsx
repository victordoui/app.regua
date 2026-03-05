import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { 
  BarChart3, Calendar, Users, Scissors, Package,
  MessageSquare, Bell, DollarSign, CreditCard,
  Crown, Building, Image, Warehouse, Plug,
  Settings, Shield, UserCircle, Clock,
  Menu, X, LogOut, ChevronsLeft, ChevronsRight,
  Receipt, Ticket, Gift, Tag, Heart, UserCheck,
  PlusCircle, Megaphone, MessageCircle, ShoppingCart, ListOrdered
} from "lucide-react";

const BARBER_PATHS = new Set([
  '/', '/appointments', '/clients', '/conversations',
  '/advanced-notifications', '/team-chat', '/shifts', '/profile'
]);

const allMenuItems = [
  { icon: BarChart3, label: "Dashboard", path: "/" },
  { icon: Calendar, label: "Agenda", path: "/appointments" },
  { icon: Users, label: "Clientes", path: "/clients" },
  { icon: Scissors, label: "Barbeiros", path: "/barbers" },
  { icon: Package, label: "Serviços", path: "/services" },
  { icon: ListOrdered, label: "Lista de Espera", path: "/waitlist" },
  { icon: Clock, label: "Turnos", path: "/shifts" },
  { icon: MessageSquare, label: "Conversas", path: "/conversations" },
  { icon: Bell, label: "Notificações", path: "/advanced-notifications" },
  { icon: Megaphone, label: "Campanhas", path: "/campaigns" },
  { icon: MessageCircle, label: "Chat Equipe", path: "/team-chat" },
  { icon: DollarSign, label: "Financeiro", path: "/reports" },
  { icon: CreditCard, label: "Contas", path: "/billing" },
  { icon: Receipt, label: "Comissões", path: "/commissions" },
  { icon: Ticket, label: "Cupons", path: "/coupons" },
  { icon: Gift, label: "Gift Cards", path: "/gift-cards" },
  { icon: Tag, label: "Preços Dinâmicos", path: "/dynamic-pricing" },
  { icon: Crown, label: "Assinaturas", path: "/subscriptions" },
  { icon: PlusCircle, label: "Novo Plano", path: "/subscriptions/new" },
  { icon: Heart, label: "Fidelidade", path: "/loyalty" },
  { icon: UserCheck, label: "Indicações", path: "/referrals" },
  { icon: ShoppingCart, label: "Caixa / PDV", path: "/cash" },
  { icon: BarChart3, label: "Rel. Vendas", path: "/sales-reports" },
  { icon: Building, label: "Empresa", path: "/settings/company" },
  { icon: Warehouse, label: "Estoque", path: "/inventory" },
  { icon: Image, label: "Galeria", path: "/gallery" },
  { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
  { icon: Users, label: "Usuários", path: "/users" },
  { icon: Plug, label: "Integrações", path: "/integrations" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

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

  const menuItems = useMemo(() => {
    if (isSuperAdmin || isAdmin) return allMenuItems;
    if (isBarbeiro) return allMenuItems.filter(item => BARBER_PATHS.has(item.path));
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

  const sidebarWidth = isCollapsed ? 64 : 240;

  return (
    <>
      {/* Mobile toggle */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="bg-card border shadow-md"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-card border-r border-border z-40 flex flex-col transition-all duration-300 ${
          isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'
        } md:relative md:translate-x-0`}
        style={{ width: isMobile ? 240 : sidebarWidth }}
      >
        {/* Logo */}
        <div className={`h-14 px-4 border-b border-border flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Scissors className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-foreground whitespace-nowrap">Na Régua</span>
          )}
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const active = isActivePath(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}

            {/* Super Admin link */}
            {isSuperAdmin && (
              <button
                onClick={() => handleNavigation('/superadmin')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mt-2 border-t border-border pt-3 ${
                  isActivePath('/superadmin')
                    ? 'bg-amber-500/10 text-amber-500 font-medium'
                    : 'text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-500'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>Super Admin</span>}
              </button>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border">
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </button>

          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors mt-1"
              aria-label={isCollapsed ? "Expandir" : "Recolher"}
            >
              {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
