import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home,
  Calendar, 
  Users, 
  Crown, 
  User, 
  LogOut,
  Menu,
  X,
  Briefcase,
  Scissors
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const clientMenu = [
  { icon: Home, label: "Início", path: "/client/home" },
  { icon: Calendar, label: "Agendamentos", path: "/client/appointments" },
  { icon: Briefcase, label: "Empresas Parceiras", path: "/client/partners" },
  { icon: Crown, label: "Plano", path: "/client/plans" },
  { icon: User, label: "Perfil", path: "/client/profile" },
];

const ClientSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

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

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema com sucesso.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

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
            className="bg-card/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-200"
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
        animate={{ x: isMobile && !isOpen ? -288 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full w-72 bg-card/95 backdrop-blur-sm border-r border-border z-40 ${
          isMobile ? 'shadow-2xl' : ''
        } md:relative md:shadow-none md:bg-card flex flex-col flex-shrink-0`}
        style={{ width: isMobile ? (isOpen ? 288 : 0) : 288 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <Scissors className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-2xl text-foreground whitespace-nowrap">Cliente Na Régua</h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            {clientMenu.map((item) => {
              const isActive = isActivePath(item.path);
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 transition-all duration-200 ${
                    isActive 
                      ? 'bg-secondary text-secondary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0 mr-3" />
                  <span className="truncate">{item.label}</span>
                </Button>
              );
            })}
            
            <div className="pt-4 border-t border-border mt-4">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200" 
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 flex-shrink-0 mr-3" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </nav>
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

export default ClientSidebar;