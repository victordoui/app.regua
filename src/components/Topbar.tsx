import { useEffect } from "react";
import { Bell, Calendar, Command, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

const Topbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { collapsed, toggle } = useSidebarCollapsed();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("topbar-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const initials = (user?.user_metadata?.full_name || user?.email || "VZ")
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed right-0 top-0 z-30 hidden h-16 items-center justify-between border-b border-border/70 bg-background/85 px-6 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl transition-[left] duration-200 md:flex md:left-[var(--sidebar-w)]">
      <div className="flex w-full max-w-xl items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-border/80 bg-card px-3 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/[0.06]">
          <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <input
            id="topbar-search-input"
            type="search"
            placeholder="Buscar clientes, agendamentos ou serviços..."
            className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="flex flex-shrink-0 items-center gap-1 rounded-md border border-border bg-muted/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm xl:inline-flex">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
        </div>
        <ThemeToggle />
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          aria-label="Notificações"
          onClick={() => navigate("/conversations?tab=notificacoes")}
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full border-2 border-card bg-primary" />
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-[11px] font-bold text-primary-foreground shadow-[0_3px_10px_rgba(37,99,235,0.2)] ring-2 ring-background"
          aria-label="Abrir perfil"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
