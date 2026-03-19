import React from "react";
import { useNavigate } from "react-router-dom";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";

const barColors = ["bg-primary", "bg-[hsl(var(--teal))]", "bg-[hsl(var(--warning))]", "bg-[hsl(var(--violet))]", "bg-[hsl(var(--rose))]"];

const TodayAppointmentsPanel = () => {
  const navigate = useNavigate();
  const { todayAppointments } = useRealtimeAppointments();

  const appointments = todayAppointments.slice(0, 4);

  return (
    <div className="bg-card border border-[hsl(var(--border))] rounded-[14px] overflow-hidden flex-1">
      <div className="flex items-center justify-between px-[18px] pt-[14px] pb-[10px]">
        <span className="font-heading text-[13px] font-bold text-foreground">Hoje</span>
        <button
          onClick={() => navigate('/appointments')}
          className="text-[11px] font-semibold text-primary cursor-pointer hover:text-[hsl(var(--brand))]"
        >
          Ver agenda →
        </button>
      </div>

      <div>
        {appointments.length === 0 ? (
          <div className="px-4 pb-4 text-xs text-muted-foreground text-center py-6">
            Nenhum agendamento hoje.
          </div>
        ) : (
          appointments.map((apt, i) => (
            <div
              key={apt.id}
              className="flex items-center gap-[10px] px-4 py-[10px] border-b border-[hsl(var(--border))] last:border-b-0 cursor-pointer hover:bg-[hsl(var(--card-2))] transition-colors"
            >
              <div className="text-center w-10 flex-shrink-0">
                <div className="font-heading text-[13px] font-bold text-foreground">
                  {apt.appointment_time?.slice(0, 5)}
                </div>
              </div>
              <div className={`w-[3px] h-[34px] rounded-sm flex-shrink-0 ${barColors[i % barColors.length]}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground mb-px truncate">
                  {apt.clients?.name || 'Cliente'}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {apt.services?.name || 'Serviço'}
                </div>
              </div>
              <div className="font-heading text-xs font-bold text-foreground flex-shrink-0">
                R${apt.total_price || apt.services?.price || 0}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodayAppointmentsPanel;
