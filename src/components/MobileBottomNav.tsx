import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, Calendar, Users, Building, Menu, X, BarChart3, CreditCard, Receipt, Tag, ShoppingCart, Crown, Heart, Briefcase, Package, MessageSquare, UserCircle, UserCheck, Shield, LogOut, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';

const mainItems = [
  { icon: Home, label: 'Painel', path: '/' },
  { icon: Calendar, label: 'Agenda', path: '/appointments' },
  { icon: Users, label: 'Clientes', path: '/clients' },
  { icon: Building, label: 'Empresa', path: '/settings/company' },
];

const moreItems = [
  { icon: Briefcase, label: 'Profissionais', path: '/barbers' },
  { icon: Package, label: 'Serviços', path: '/services' },
  { icon: MessageSquare, label: 'Conversas', path: '/conversations' },
  { icon: BarChart3, label: 'Insights', path: '/reports' },
  { icon: CreditCard, label: 'Contas', path: '/billing' },
  { icon: Receipt, label: 'Comissões', path: '/commissions' },
  { icon: Tag, label: 'Promoções', path: '/coupons' },
  { icon: ShoppingCart, label: 'Caixa / PDV', path: '/cash' },
  { icon: Crown, label: 'Planos', path: '/subscriptions' },
  { icon: Heart, label: 'Rewards', path: '/loyalty' },
  { icon: UserCircle, label: 'Meu Perfil', path: '/profile' },
  { icon: UserCheck, label: 'Usuários', path: '/users' },
  { icon: Sparkles, label: 'Fazer Upgrade', path: '/upgrade' },
];

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { isSuperAdmin } = useRole();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-colors"
            >
              <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-colors">
              <Menu className={`h-5 w-5 ${open ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium ${open ? 'text-primary' : 'text-muted-foreground'}`}>Mais</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-4 gap-3 pt-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setOpen(false); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors hover:bg-muted"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-[11px] font-medium text-center leading-tight ${active ? 'text-primary' : 'text-foreground'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {isSuperAdmin && (
                <button
                  onClick={() => { navigate('/superadmin'); setOpen(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors hover:bg-muted"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10">
                    <Shield className="h-5 w-5 text-amber-500" />
                  </div>
                  <span className="text-[11px] font-medium text-amber-600">Super Admin</span>
                </button>
              )}

              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors hover:bg-destructive/5"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10">
                  <LogOut className="h-5 w-5 text-destructive" />
                </div>
                <span className="text-[11px] font-medium text-destructive">Sair</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
