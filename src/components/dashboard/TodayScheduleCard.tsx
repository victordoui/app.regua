import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "border-green-500";
      case "confirmed": return "border-primary";
      case "cancelled": return "border-destructive";
      default: return "border-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500/10 text-green-500 text-[10px] border-0">Concluído</Badge>;
      case "confirmed": return <Badge className="bg-primary/10 text-primary text-[10px] border-0">Confirmado</Badge>;
      case "cancelled": return <Badge className="bg-destructive/10 text-destructive text-[10px] border-0">Cancelado</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">Pendente</Badge>;
    }
  };

  return (
    <Card className="rounded-2xl h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Agenda de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 max-h-[280px] overflow-y-auto">
        {appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhum agendamento para hoje
          </div>
        ) : (
          appointments.map((apt) => (
            <div
              key={apt.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors border-l-3 ${getStatusColor(apt.status)}`}
            >
              <div className="flex items-center gap-1.5 text-primary min-w-[52px]">
                <Clock className="h-3 w-3" />
                <span className="text-xs font-semibold">{apt.appointment_time?.slice(0, 5)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {apt.clients?.name || "Cliente"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {apt.services?.name || "Serviço"}
                </p>
              </div>
              {getStatusBadge(apt.status)}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TodayScheduleCard;
