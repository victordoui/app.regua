import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/contexts/RoleContext";
import { 
  // Navegação Principal
  Home,
  // Visão Geral
  BarChart3,
  TrendingUp,
  Target,
  // Operações
  Calendar, 
  Users, 
  Scissors, 
  Package,
  // Comunicação
  MessageSquare, 
  Bell, 
  Megaphone,
  // Financeiro
  DollarSign,
  CreditCard,
  Ticket,
  Receipt,
  // Assinaturas
  Crown,
  Heart,
  // Minha Empresa
  Building,
  Image,
  Warehouse,
  Plug,
  // Administração
  Settings,
  Shield,
  Star,
  ListOrdered,
  UserCheck,
  // Vendas / Caixa
  ShoppingCart,
  // Novas Funcionalidades
  Gift,
  Clock,
  MessageCircle,
  Tag,
  // Gerais
  PlusCircle,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin } = useRole();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuStructure = [
    { 
      category: "dashboard",
      label: "Dashboard",
      icon: Home,
      items: [
        { icon: BarChart3, label: "Visão Geral", path: "/" },
        { icon: TrendingUp, label: "Sucesso do Cliente", path: "/customer-success" },
        { icon: Target, label: "Desempenho dos Barbeiros", path: "/barber-performance" },
        { icon: Star, label: "Avaliações", path: "/reviews" }
      ]
    },
    {
      category: "operacoes",
      label: "Operações",
      icon: Package,
      items: [
        { icon: Calendar, label: "Agendamentos", path: "/appointments" },
        { icon: Users, label: "Clientes", path: "/clients" },
        { icon: Scissors, label: "Barbeiros", path: "/barbers" },
        { icon: Package, label: "Serviços", path: "/services" },
        { icon: ListOrdered, label: "Lista de Espera", path: "/waitlist" },
        { icon: Clock, label: "Turnos / Escalas", path: "/shifts" }
      ]
    },
    {
      category: "comunicacao",
      label: "Comunicação",
      icon: MessageSquare,
      items: [
        { icon: MessageSquare, label: "Conversas", path: "/conversations" },
        { icon: Bell, label: "Notificações", path: "/advanced-notifications" },
        { icon: Megaphone, label: "Campanhas / Marketing", path: "/campaigns" },
        { icon: MessageCircle, label: "Chat da Equipe", path: "/team-chat" }
      ]
    },
    {
      category: "financeiro",
      label: "Financeiro",
      icon: DollarSign,
      items: [
        { icon: BarChart3, label: "Visão Financeira", path: "/reports" }, // Reutilizando Reports
        { icon: CreditCard, label: "Contas a Pagar / Receber", path: "/billing" },
        { icon: Receipt, label: "Comissões", path: "/commissions" },
        { icon: Ticket, label: "Cupons", path: "/coupons" },
        { icon: Gift, label: "Gift Cards", path: "/gift-cards" },
        { icon: Tag, label: "Preços Dinâmicos", path: "/dynamic-pricing" }
      ]
    },
    {
      category: "assinaturas",
      label: "Assinaturas",
      icon: Crown,
      items: [
        { icon: Crown, label: "Gerenciar Planos", path: "/subscriptions" },
        { icon: PlusCircle, label: "Criar / Editar Plano", path: "/subscriptions/new" },
        { icon: Heart, label: "Fidelidade", path: "/loyalty" },
        { icon: UserCheck, label: "Indicações", path: "/referrals" }
      ]
    },
    {
      category: "empresa",
      label: "Minha Empresa",
      icon: Building,
      items: [
        { icon: Building, label: "Empresa", path: "/settings/company" },
        { icon: Warehouse, label: "Estoque", path: "/inventory" },
        { icon: Image, label: "Galeria", path: "/gallery" }
      ]
    },
    {
      category: "administracao",
      label: "Administração",
      icon: Shield,
      items: [
        { icon: UserCheck, label: "Usuários e Permissões", path: "/users" },
        { icon: Plug, label: "Integrações", path: "/integrations" },
        { icon: Settings, label: "Configurações Gerais", path: "/settings" }
      ]
    },
    {
      category: "vendas",
      label: "Vendas / Caixa",
      icon: ShoppingCart,
      items: [
        { icon: ShoppingCart, label: "Caixa e PDV", path: "/cash" },
        { icon: BarChart3, label: "Relatórios de Vendas", path: "/sales-reports" }
      ]
    }
  ];

  // Função para expandir categorias ativas por padrão
  useEffect(() => {
    const activeCategories = menuStructure
      .filter(category => 
        category.items?.some(item => isActivePath(item.path))
      )
      .map(category => category.category);
      
    setExpandedCategories(activeCategories);
  }, [location.pathname]);


  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleSignOut = () => {
    navigate("/login"); // Redireciona para login
  };

  const toggleCategory = (category: string) => {
    if (isCollapsed) {
      // Se estiver colapsado, expande a sidebar temporariamente para mostrar o menu
      setIsCollapsed(false);
      // E expande a categoria
      setExpandedCategories(prev => 
        prev.includes(category) 
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    } else {
      setExpandedCategories(prev => 
        prev.includes(category) 
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

  const renderMenuItem = (item: any, isSubItem = false, parentCategory = "") => {
    const isActive = isActivePath(item.path);
    const isExpanded = expandedCategories.includes(parentCategory);

    if (isSubItem && parentCategory && !isExpanded && !isCollapsed) {
      return null;
    }

    return (
      <div
        key={item.path}
      >
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start h-10 transition-all duration-200 ${
            isSubItem ? `ml-4 pl-8 text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}` : ''
          } ${
            isActive 
              ? 'bg-secondary text-secondary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          } ${isCollapsed ? 'justify-center ml-0 pl-3 pr-3' : ''}`}
          onClick={() => handleNavigation(item.path)}
        >
          <item.icon className={`h-4 w-4 flex-shrink-0 ${!isCollapsed ? 'mr-3' : 'mr-0'}`} />
          <span className={`truncate ${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
          {item.path === "/appointments" && !isCollapsed && (
            <Badge variant="secondary" className="ml-auto text-xs flex-shrink-0">
              12
            </Badge>
          )}
        </Button>
      </div>
    );
  };

  const renderCategory = (category: any) => {
    const isExpanded = expandedCategories.includes(category.category);
    const hasActiveItem = category.items?.some((item: any) => isActivePath(item.path));

    return (
      <div key={category.category} className="space-y-1">
        <Button
          variant="ghost"
          className={`w-full justify-start h-10 transition-all duration-200 font-medium ${
            hasActiveItem 
              ? 'text-primary bg-primary/5' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          } ${isCollapsed ? 'justify-center' : ''}`}
          onClick={() => toggleCategory(category.category)}
        >
          <category.icon className={`h-4 w-4 flex-shrink-0 ${!isCollapsed ? 'mr-3' : 'mr-0'}`} />
          <span className={`truncate ${isCollapsed ? 'hidden' : 'block'}`}>{category.label}</span>
          {!isCollapsed && (
            <div className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
        </Button>
        
        {/* Renderização dos sub-itens */}
        {isExpanded && category.items && (
          <div className="overflow-hidden space-y-1">
            {category.items.map((item: any) => renderMenuItem(item, true, category.category))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-4 left-4 z-50"
        >
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.div>
          </Button>
        </motion.div>
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 64 : 240, x: isMobile && !isOpen ? -240 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full bg-card/95 backdrop-blur-sm border-r border-border z-40 ${
          isMobile ? 'shadow-2xl' : ''
        } md:relative md:shadow-none md:bg-card flex flex-col`}
        style={{ width: isMobile ? (isOpen ? 240 : 0) : (isCollapsed ? 64 : 240) }}
      >
        {/* Header */}
        <div className={`p-4 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <h2 className="font-bold text-xl text-foreground whitespace-nowrap">Na Régua</h2>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 overflow-y-auto flex-1">
          <div className="space-y-1">
            {/* Categories */}
            {menuStructure.map((category, index) => (
              <div
                key={category.category}
              >
                {renderCategory(category)}
              </div>
            ))}

            {/* Super Admin Link */}
            {isSuperAdmin && (
              <div className="pt-4 border-t border-amber-500/30">
                <Button
                  variant="ghost"
                  className={`w-full h-10 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 transition-all duration-200 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                  onClick={() => handleNavigation('/superadmin')}
                >
                  <Shield className={`h-4 w-4 flex-shrink-0 ${!isCollapsed ? 'mr-3' : 'mr-0'}`} />
                  <span className={isCollapsed ? 'hidden' : 'block'}>Super Admin</span>
                </Button>
              </div>
            )}

            {/* Divider */}
            <div className="pt-4 border-t border-border">
              <div className="h-px bg-border my-4"></div>
            </div>

            {/* Sign Out */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className={`w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200 ${isCollapsed ? 'justify-center' : 'justify-start'}`} 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className={`h-4 w-4 flex-shrink-0 ${!isCollapsed ? 'mr-2' : 'mr-0'}`} />
                <span className={isCollapsed ? 'hidden' : 'block'}>Sair</span>
              </Button>
            </div>
          </div>
        </nav>

        {/* User info and Collapse Button */}
        <div 
          className="p-4 border-t border-border bg-muted/30 flex items-center justify-between"
        >
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'hidden' : 'flex'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-sm font-medium text-primary-foreground">WM</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Wesley Martins</p>
              <p className="text-xs text-muted-foreground truncate">Administrador</p>
            </div>
          </div>
          
          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 transition-transform duration-300 ${isCollapsed ? 'mx-auto' : ''}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;