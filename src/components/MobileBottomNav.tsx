import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  BarChart3, Briefcase, Building, Calendar, CreditCard, Crown, Heart, Home, LogOut,
  Menu, MessageSquare, Package, Plus, Receipt, Shield, ShoppingCart, Sparkles,
  Tag, UserCheck, UserCircle, Users,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";

const mainItems = [
  { icon: Home, label: "Painel", path: "/" },
  { icon: Calendar, label: "Agenda", path: "/appointments" },
  { icon: Users, label: "Clientes", path: "/clients" },
];

const moreItems = [
  { icon: Building, label: "Minha Empresa", path: "/settings/company" },
  { icon: Briefcase, label: "Profissionais", path: "/barbers" },
  { icon: Package, label: "Serviços", path: "/services" },
  { icon: MessageSquare, label: "Conversas", path: "/conversations" },
  { icon: BarChart3, label: "Insights", path: "/reports" },
  { icon: CreditCard, label: "Contas", path: "/billing" },
  { icon: Receipt, label: "Comissões", path: "/commissions" },
  { icon: Tag, label: "Promoções", path: "/coupons" },
  { icon: ShoppingCart, label: "Caixa / PDV", path: "/cash" },
  { icon: Crown, label: "Planos", path: "/subscriptions" },
  { icon: Heart, label: "Rewards", path: "/loyalty" },
  { icon: UserCircle, label: "Meu Perfil", path: "/profile" },
  { icon: UserCheck, label: "Usuários", path: "/users" },
  { icon: Sparkles, label: "Upgrade", path: "/upgrade" },
];

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { isSuperAdmin } = useRole();
  const { signOut } = useAuth();
  const isActive = (path: string) => path === "/" ? location.pathname === path : location.pathname.startsWith(path);

  const NavItem = ({ item }: { item: (typeof mainItems)[number] }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <button onClick={() => navigate(item.path)} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2">
        <span className={`flex h-7 w-10 items-center justify-center rounded-full transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className={`text-[10px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>{item.label}</span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-background/92 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl safe-area-bottom">
      <div className="mx-auto flex h-[70px] max-w-lg items-center justify-around px-2">
        <NavItem item={mainItems[0]} />
        <NavItem item={mainItems[1]} />

        <button onClick={() => navigate("/appointments?new=1")} className="flex flex-1 flex-col items-center gap-1" aria-label="Novo agendamento">
          <span className="-mt-6 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(37,99,235,0.35)] ring-4 ring-background">
            <Plus className="h-6 w-6" />
          </span>
          <span className="text-[10px] font-bold text-primary">Novo</span>
        </button>

        <NavItem item={mainItems[2]} />

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2">
              <span className={`flex h-7 w-10 items-center justify-center rounded-full ${open ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                <Menu className="h-5 w-5" />
              </span>
              <span className={`text-[10px] font-bold ${open ? "text-primary" : "text-muted-foreground"}`}>Mais</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[78vh] overflow-y-auto rounded-t-[28px] px-5 pb-8">
            <SheetHeader className="pb-3 text-left"><SheetTitle>Todos os módulos</SheetTitle></SheetHeader>
            <div className="grid grid-cols-4 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); }} className="flex flex-col items-center gap-2 rounded-2xl p-2.5 transition-colors hover:bg-muted">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-center text-[10px] font-semibold leading-tight ${active ? "text-primary" : "text-foreground"}`}>{item.label}</span>
                  </button>
                );
              })}
              {isSuperAdmin && (
                <button onClick={() => { navigate("/superadmin"); setOpen(false); }} className="flex flex-col items-center gap-2 rounded-2xl p-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><Shield className="h-5 w-5" /></div>
                  <span className="text-center text-[10px] font-semibold text-amber-600">Super Admin</span>
                </button>
              )}
              <button onClick={async () => { await signOut(); setOpen(false); navigate("/login"); }} className="flex flex-col items-center gap-2 rounded-2xl p-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><LogOut className="h-5 w-5" /></div>
                <span className="text-[10px] font-semibold text-destructive">Sair</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
