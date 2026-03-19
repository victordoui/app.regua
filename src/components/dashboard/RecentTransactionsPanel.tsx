import React from "react";
import { useNavigate } from "react-router-dom";
import { useRealtimeAppointments } from "@/hooks/useRealtimeAppointments";

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "● Pago", className: "bg-[hsl(var(--success-bg))] text-[hsl(var(--success))] border border-[hsl(var(--success-border))]" },
  confirmed: { label: "● Confirmado", className: "bg-[hsl(var(--sky-bg))] text-[hsl(var(--sky))] border border-[hsl(var(--sky-border))]" },
  pending: { label: "● Pendente", className: "bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning))] border border-[hsl(var(--warning-border))]" },
  cancelled: { label: "● Cancelado", className: "bg-[hsl(var(--rose-bg))] text-[hsl(var(--rose))] border border-[hsl(var(--rose-border))]" },
};

const RecentTransactionsPanel = () => {
  const navigate = useNavigate();
  const { todayAppointments } = useRealtimeAppointments();
  const transactions = todayAppointments.slice(0, 5);

  return (
    <div className="bg-card border border-[hsl(var(--border))] rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-heading text-[15px] font-bold text-foreground">Transações Recentes</span>
        <button
          onClick={() => navigate('/billing')}
          className="text-[11px] font-semibold text-primary cursor-pointer hover:text-[hsl(var(--brand))]"
        >
          Ver todas →
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.5px] px-[18px] pb-2 border-b border-[hsl(var(--border))]">Cliente</th>
            <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.5px] pb-2 border-b border-[hsl(var(--border))]">Serviço</th>
            <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.5px] pb-2 border-b border-[hsl(var(--border))]">Status</th>
            <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.5px] px-[18px] pb-2 border-b border-[hsl(var(--border))]">Valor</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-xs text-muted-foreground py-6 px-[18px]">
                Nenhuma transação recente.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => {
              const status = statusConfig[tx.status] || statusConfig.pending;
              const isCancelled = tx.status === 'cancelled';
              return (
                <tr key={tx.id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--card-2))] cursor-pointer transition-colors">
                  <td className="px-[18px] py-[10px]">
                    <div className="text-xs font-semibold text-foreground">{tx.clients?.name || 'Cliente'}</div>
                    <div className="text-[10px] text-muted-foreground mt-px">#{tx.id.slice(0, 4)}</div>
                  </td>
                  <td className="text-xs text-muted-foreground py-[10px]">{tx.services?.name || 'Serviço'}</td>
                  <td className="py-[10px]">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-[9px] py-[3px] rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className={`text-right px-[18px] py-[10px] font-heading text-xs font-bold ${isCancelled ? 'text-[hsl(var(--rose))]' : 'text-foreground'}`}>
                    {isCancelled ? '–' : ''} R$ {tx.total_price || tx.services?.price || 0}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactionsPanel;
