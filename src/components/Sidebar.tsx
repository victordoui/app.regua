import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
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
  Scissors, // Importado
  Package,
  // Comunicação
  MessageSquare, 
  Bell, 
  Megaphone,
  // Financeiro
  DollarSign,
  CreditCard,
  Receipt,
  // Assinaturas
  Crown,
  // Minha Empresa
  Building,
  Warehouse,
  Plug,
  // Administração
  Settings,
  Shield,
  UserCheck,
  // Vendas / Caixa
  ShoppingCart,
  // Gerais
  PlusCircle,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

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
        { icon: Target, label: "Desempenho dos Barbeiros", path: "/barber-performance" }
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
        { icon: Package, label: "Serviços", path: "/services" }
      ]
    },
    {
      category: "comunicacao",
      label: "Comunicação",
      icon: MessageSquare,
      items: [
        { icon: MessageSquare, label: "Conversas", path: "/conversations" },
        { icon: Bell, label: "Notificações", path: "/advanced-notifications" }, // Unificado
        { icon: Megaphone, label: "Campanhas / Marketing", path: "/campaigns" }
      ]
    },
    {
      category: "financeiro",
      label: "Financeiro",
      icon: DollarSign,
      items: [
        { icon: BarChart3, label: "Visão Financeira", path: "/reports" }, // Reutilizando Reports
        { icon: CreditCard, label: "Contas a Pagar / Receber", path: "/billing" },
        { icon: Receipt, label: "Comissões", path: "/commissions" }
      ]
    },
    {
      category: "assinaturas",
      label: "Assinaturas",
      icon: Crown,
      items: [
        { icon: Crown, label: "Gerenciar Planos", path: "/subscriptions" },
        { icon: PlusCircle, label: "Criar / Editar Plano", path: "/subscriptions/new" } // Nova rota para criação/edição
      ]
    },
    {
      category: "empresa",
      label: "Minha Empresa",
      icon: Building,
      items: [
        { icon: Building, label: "Dados da Empresa", path: "/settings/company" },
        { icon: Warehouse, label: "Estoque", path: "/inventory" },
        { icon: Plug, label: "Integrações (WhatsApp)", path: "/integrations" }
      ]
    },
    {
      category: "administracao",
      label: "Administração",
      icon: Settings,
      items: [
        { icon: UserCheck, label: "Usuários e Permissões", path: "/users" },
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
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const isActivePath = (path: string) => location.pathname === path;

  const renderMenuItem = (item: any, isSubItem = false, parentCategory = "") => {
    const isActive = isActivePath(item.path);
    const isExpanded = expandedCategories.includes(parentCategory);

    if (isSubItem && parentCategory && !isExpanded) {
      return null;
    }

    return (
      <motion.div
        key={item.path}
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0 }
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start h-11 transition-all duration-200 ${
            isSubItem ? `ml-6 pl-8 text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}` : ''
          } ${
            isActive 
              ? 'bg-secondary text-secondary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
          onClick={() => handleNavigation(item.path)}
        >
          <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
          {item.path === "/appointments" && (
            <Badge variant="secondary" className="ml-auto text-xs flex-shrink-0">
              12
            </Badge>
          )}
        </Button>
      </motion.div>
    );
  };

  const renderCategory = (category: any) => {
    const isExpanded = expandedCategories.includes(category.category);
    const hasActiveItem = category.items?.some((item: any) => isActivePath(item.path));

    return (
      <div key={category.category} className="space-y-1">
        <Button
          variant="ghost"
          className={`w-full justify-start h-11 transition-all duration-200 font-medium ${
            hasActiveItem 
              ? 'text-primary bg-primary/5' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
          onClick={() => toggleCategory(category.category)}
        >
          <category.icon className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="truncate">{category.label}</span>
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </Button>
        
        {/* Renderização dos sub-itens com animação de altura */}
        <AnimatePresence initial={false}>
          {isExpanded && category.items && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 }
              }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden space-y-1"
            >
              {category.items.map((item: any) => renderMenuItem(item, true, category.category))}
            </motion.div>
          )}
        </AnimatePresence>
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
      <AnimatePresence mode="wait">
        {(!isMobile || isOpen) && (
          <motion.div
            initial={isMobile ? { x: -256, opacity: 0 } : { x: 0, opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={isMobile ? { x: -256, opacity: 0 } : { x: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className={`fixed left-0 top-0 h-full w-72 bg-card/95 backdrop-blur-sm border-r border-border z-40 ${
              isMobile ? 'shadow-2xl' : ''
            } md:relative md:shadow-none md:bg-card`}
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                {/* Ícone de Tesoura */}
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-600 rounded-lg flex items-center justify-center">
                  <Scissors className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Na Régua</h2>
                  <p className="text-xs text-muted-foreground/80">Barbearia</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 overflow-y-auto flex-1">
              <motion.div 
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
              >
                {/* Categories */}
                {menuStructure.map((category, index) => (
                  <motion.div
                    key={category.category}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                  >
                    {renderCategory(category)}
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="pt-6 border-t border-border">
                  <div className="h-px bg-border my-4"></div>
                </div>

                {/* Sign Out */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200" 
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </motion.div>
              </motion.div>
            </nav>

            {/* User info */}
            <motion.div 
              className="p-4 border-t border-border bg-muted/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-medium text-primary-foreground">WM</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">Wesley Martins</p>
                  <p className="text-xs text-muted-foreground truncate">Administrador</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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