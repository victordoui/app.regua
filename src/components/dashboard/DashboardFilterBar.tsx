import { Filter, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { DashboardFilters } from "@/hooks/useRealtimeDashboard";

interface DashboardFilterBarProps {
  filters: DashboardFilters;
  serviceOptions: string[];
  isRefreshing: boolean;
  onChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  embedded?: boolean;
}

const inputClass = "min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground shadow-sm outline-none transition-colors hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15";

const DashboardFilterBar = ({ filters, serviceOptions, isRefreshing, onChange, onRefresh, embedded = false }: DashboardFilterBarProps) => (
  <section className={`${embedded ? "flex flex-col gap-3 border-b border-border px-4 py-3 xl:flex-row xl:items-center xl:justify-between" : "dashboard-surface flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between"}`}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <SlidersHorizontal className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Central de análise</p>
        <h2 className="mt-0.5 text-sm font-extrabold text-foreground">Painel Analítico</h2>
        <p className="text-xs font-medium text-muted-foreground">Personalize o período, situação e serviços em todos os indicadores.</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <label className="sr-only" htmlFor="dashboard-period">Período</label>
      <select id="dashboard-period" className={inputClass} value={filters.periodMonths} onChange={(event) => onChange({ ...filters, periodMonths: Number(event.target.value) as DashboardFilters["periodMonths"] })}>
        <option value={3}>Últimos 3 meses</option>
        <option value={6}>Últimos 6 meses</option>
        <option value={12}>Últimos 12 meses</option>
      </select>

      <label className="sr-only" htmlFor="dashboard-status">Situação</label>
      <select id="dashboard-status" className={inputClass} value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as DashboardFilters["status"] })}>
        <option value="all">Todas as situações</option>
        <option value="completed">Concluídos</option>
        <option value="confirmed">Confirmados</option>
        <option value="cancelled">Cancelados</option>
      </select>

      <label className="sr-only" htmlFor="dashboard-service">Serviço</label>
      <select id="dashboard-service" className={`${inputClass} col-span-2 sm:max-w-[220px]`} value={filters.service} onChange={(event) => onChange({ ...filters, service: event.target.value })}>
        <option value="all">Todos os serviços</option>
        {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
      </select>

      <button type="button" onClick={() => onChange({ periodMonths: 6, status: "all", service: "all" })} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <Filter className="h-4 w-4" /> Limpar
      </button>
      <button type="button" onClick={onRefresh} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Atualizar
      </button>
    </div>
  </section>
);

export default DashboardFilterBar;
