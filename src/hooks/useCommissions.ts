import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { BarberCommissionSummary, CommissionDetail } from "@/types/commissions";
import { Barber } from "@/types/appointments"; // Reusing Barber type from appointments

// Define a default commission rate
const DEFAULT_COMMISSION_RATE = 0.40; // 40%

export const useCommissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [selectedBarberId, setSelectedBarberId] = useState<string | 'all'>('all');

  const fetchCommissionData = useCallback(async () => {
    if (!user) return { appointments: [], barbers: [] };

    try {
      // Fetch appointments with client, service, and barber profile details
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          total_price,
          barbeiro_id,
          clients (name),
          services (name, price),
          barber_profile:profiles!barbeiro_id (first_name, last_name)
        `)
        .eq("user_id", user.id)
        .gte("appointment_date", format(startDate, 'yyyy-MM-dd'))
        .lte("appointment_date", format(endDate, 'yyyy-MM-dd'))
        .eq("status", "completed"); // Only completed appointments generate commission

      if (appointmentsError) throw appointmentsError;

      // Fetch all barbers (profiles with role 'barbeiro')
      const { data: barbersData, error: barbersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("role", "barbeiro");

      if (barbersError) throw barbersError;

      const barbers: Barber[] = (barbersData || []).map(profile => ({
        id: profile.id,
        user_id: profile.id,
        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Barbeiro Desconhecido',
        email: profile.email,
        role: 'barbeiro'
      }));

      return {
        appointments: appointmentsData || [],
        barbers: barbers,
      };
    } catch (error: any) {
      console.error("Error fetching commission data:", error);
      toast({
        title: "Erro ao carregar dados de comissão",
        description: error.message,
        variant: "destructive",
      });
      return { appointments: [], barbers: [] };
    }
  }, [user, startDate, endDate, toast]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["commissions", user?.id, startDate, endDate],
    queryFn: fetchCommissionData,
    enabled: !!user,
    initialData: { appointments: [], barbers: [] },
  });

  const { appointments, barbers } = data;

  const calculatedCommissions = useMemo(() => {
    const barberSummaries: { [key: string]: BarberCommissionSummary } = {};
    const commissionDetails: CommissionDetail[] = [];
    let totalOverallCommission = 0;

    const filteredAppointments = selectedBarberId === 'all'
      ? appointments
      : appointments.filter((apt: any) => apt.barbeiro_id === selectedBarberId);

    for (const apt of filteredAppointments) {
      const servicePrice = apt.services?.price || 0;
      const commissionAmount = servicePrice * DEFAULT_COMMISSION_RATE;
      const barberName = `${apt.barber_profile?.first_name || ''} ${apt.barber_profile?.last_name || ''}`.trim() || 'Barbeiro Desconhecido';

      if (apt.barbeiro_id) {
        if (!barberSummaries[apt.barbeiro_id]) {
          barberSummaries[apt.barbeiro_id] = {
            barber_id: apt.barbeiro_id,
            barber_name: barberName,
            total_commission: 0,
            completed_appointments_count: 0,
          };
        }
        barberSummaries[apt.barbeiro_id].total_commission += commissionAmount;
        barberSummaries[apt.barbeiro_id].completed_appointments_count += 1;
      }

      commissionDetails.push({
        appointment_id: apt.id,
        client_name: apt.clients?.name || 'Cliente Desconhecido',
        service_name: apt.services?.name || 'Serviço Desconhecido',
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        service_price: servicePrice,
        commission_rate: DEFAULT_COMMISSION_RATE,
        commission_amount: commissionAmount,
        barber_name: barberName,
      });
      totalOverallCommission += commissionAmount;
    }

    return {
      barberSummaries: Object.values(barberSummaries),
      commissionDetails,
      totalOverallCommission,
    };
  }, [appointments, selectedBarberId]);

  return {
    barbers,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedBarberId,
    setSelectedBarberId,
    calculatedCommissions,
    isLoading,
  };
};