import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface TodayAppointment {
  id: string;
  appointment_time: string;
  status: string;
  clients: { name: string } | null;
  services: { name: string } | null;
}

const statusConfig: Record<string, { dot: string; label: string }> = {
  completed: { dot: "bg-green-500 shadow-green-500/40", label: "Concluído" },
  confirmed: { dot: "bg-[#4FA3FF] shadow-[#4FA3FF]/40", label: "Confirmado" },
  pending: { dot: "bg-yellow-500 shadow-yellow-500/40", label: "Pendente" },
  cancelled: { dot: "bg-red-500 shadow-red-500/40", label: "Cancelado" },
};

const TodayScheduleCard: React.FC = () => {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: appointments = [] } = useQuery({
    queryKey: ["today-schedule", user?.id, today],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("appointments")
        .select("id, appointment_time, status, clients(name), services(name)")
        .eq("user_id", user.id)
        .eq("appointment_date", today)
        .order("appointment_time", { ascending: true })
        .limit(8);
      return (data as unknown as TodayAppointment[]) || [];
    },
    enabled: !!user?.id,
  });

  return (
    <Card className="rounded-xl h-full border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#4FA3FF] to-[#1F4FA3]">
            <Calendar className="h-3.5 w-3.5 text-white" />
          </div>
          Agenda de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto pr-2">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum agendamento para hoje
          </div>
        ) : (
          <div className="relative">
            {appointments.map((apt, index) => {
              const config = statusConfig[apt.status] || statusConfig.pending;
              const isLast = index === appointments.length - 1;

              return (
                <div key={apt.id} className="flex gap-4 relative">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${config.dot} shadow-md shrink-0 mt-1`} />
                    {!isLast && (
                      <div className="w-px flex-1 bg-border min-h-[32px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-primary">
                        {apt.appointment_time?.slice(0, 5)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{config.label}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {apt.clients?.name || "Cliente"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {apt.services?.name || "Serviço"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayScheduleCard;
