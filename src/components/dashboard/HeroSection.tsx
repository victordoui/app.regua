import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, SlidersHorizontal } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { settings } = useCompanySettings();
  const { metrics } = useRealtimeDashboard();
  const today = new Date();
  const dateStr = format(today, "dd MMM, yyyy", { locale: ptBR });
  const companyName = settings?.company_name || "Usuário";

  return (
    <div className="flex items-start justify-between mb-1">
      <div>
        <div className="inline-flex items-center gap-1.5 bg-white border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground mb-2.5 cursor-pointer hover:border-[hsl(var(--border))]">
          <Calendar className="h-3 w-3" />
          {dateStr}
        </div>
        <h1 className="font-heading text-[22px] font-extrabold text-foreground tracking-tight mb-1 flex items-center gap-2">
          Olá, {companyName} 👋
        </h1>
        <p className="text-xs text-muted-foreground font-normal">
          Aqui está o resumo do seu negócio hoje. Você tem {metrics.todayAppointments} agendamentos pendentes.
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {}}
          className="flex items-center gap-[7px] border border-[hsl(213,27%,84%)] bg-white rounded-[9px] px-4 py-[9px] text-[13px] font-medium text-muted-foreground cursor-pointer transition-all hover:bg-[hsl(var(--card-2))] hover:text-foreground"
        >
          <SlidersHorizontal className="h-[13px] w-[13px]" />
          Filtros
        </button>
        <button
          onClick={() => navigate('/appointments')}
          className="flex items-center gap-[7px] bg-primary text-white border-none rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold cursor-pointer transition-all hover:bg-[hsl(var(--brand))] hover:-translate-y-px shadow-[0_4px_14px_rgba(37,99,235,0.16)]"
        >
          <Plus className="h-[13px] w-[13px]" strokeWidth={2.2} />
          Novo Agendamento
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
