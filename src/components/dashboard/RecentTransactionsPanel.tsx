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
    <div className="bg-card border border-border rounded-[14px] overflow-hidden h-fit">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-heading text-[15px] font-bold text-foreground">Transações Recentes</span>
        <button
          onClick={() => navigate("/billing")}
          className="text-[11px] font-semibold text-primary cursor-pointer hover:opacity-80"
        >
          Ver todas →
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.5px] px-5 pb-2.5 border-b border-border">Cliente</th>
            <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.5px] pb-2.5 border-b border-border">Serviço</th>
            <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.5px] pb-2.5 border-b border-border">Status</th>
            <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.5px] px-5 pb-2.5 border-b border-border">Valor</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-xs text-muted-foreground py-8 px-5">
                Nenhuma transação recente.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => {
              const status = statusConfig[tx.status] || statusConfig.pending;
              const isCancelled = tx.status === "cancelled";
              return (
                <tr key={tx.id} className="border-b border-border last:border-b-0 hover:bg-accent/50 cursor-pointer transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-sm font-semibold text-foreground">{tx.clients?.name || "Cliente"}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">#{tx.id.slice(0, 4)}</div>
                  </td>
                  <td className="text-xs text-muted-foreground py-3">{tx.services?.name || "Serviço"}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className={`text-right px-5 py-3 font-heading text-sm font-bold ${isCancelled ? "text-[hsl(var(--rose))]" : "text-foreground"}`}>
                    {isCancelled ? "–" : ""} R$ {tx.total_price || tx.services?.price || 0}
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
