import { useEffect } from "react";
import { Bell, Calendar, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Topbar = () => {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin, isBarbeiro } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('topbar-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'VZ';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isAdmin) return 'Administrador';
    if (isBarbeiro) return 'Profissional';
    return 'Usuário';
  };

  return (
    <header className="fixed top-0 right-0 left-[234px] z-30 h-14 bg-white border-b border-[hsl(var(--border))] flex items-center justify-between px-7 max-md:left-0">
      {/* Search */}
      <div className="flex items-center gap-2 bg-[hsl(var(--card-2))] border border-[hsl(var(--border))] rounded-[10px] px-3 py-2 w-full max-w-md focus-within:border-primary transition-colors">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          id="topbar-search-input"
          type="text"
          placeholder="Buscar..."
          className="border-none bg-transparent outline-none text-sm text-foreground w-full placeholder:text-muted-foreground"
        />
        <kbd className="text-[10px] text-muted-foreground border border-[hsl(var(--border))] rounded px-1.5 py-0.5 whitespace-nowrap flex-shrink-0">
          ⌘K
        </kbd>
      </div>

      {/* Date + Right actions */}
      <div className="flex items-center gap-3 ml-4">
        <div className="inline-flex items-center gap-1.5 bg-[hsl(var(--card-2))] border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(), "dd MMM, yyyy", { locale: ptBR })}
        </div>
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--card-2))] transition-colors"
          aria-label="Notificações"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--brand-light))] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-[0_2px_8px_rgba(37,99,235,0.16)]">
          {getUserInitials()}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
