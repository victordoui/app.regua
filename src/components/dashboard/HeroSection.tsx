import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { Plus, SlidersHorizontal } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { settings } = useCompanySettings();
  const { metrics } = useRealtimeDashboard();
  const companyName = settings?.company_name || "Usuário";

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-heading text-[26px] font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Olá, {companyName} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {}}
            className="flex items-center gap-[7px] border border-[hsl(var(--border))] bg-card rounded-[9px] px-4 py-[9px] text-[13px] font-medium text-muted-foreground cursor-pointer transition-all hover:bg-[hsl(var(--card-2))] hover:text-foreground"
          >
            <SlidersHorizontal className="h-[13px] w-[13px]" />
            Filtros
          </button>
          <button
            onClick={() => navigate('/appointments')}
            className="flex items-center gap-[7px] bg-primary text-primary-foreground border-none rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-px shadow-[0_4px_14px_hsl(var(--primary)/0.16)]"
          >
            <Plus className="h-[13px] w-[13px]" strokeWidth={2.2} />
            Novo Agendamento
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-normal">
        Aqui está o resumo do seu negócio hoje. Você tem {metrics.todayAppointments} agendamentos pendentes.
      </p>
    </div>
  );
};

export default HeroSection;
