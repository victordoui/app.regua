import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { BarberCommissionSummary, CommissionDetail } from "@/types/commissions";
import { Barber } from "@/types/appointments";

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
          barber_profile:profiles!barbeiro_id (display_name, email)
        `)
        .eq("user_id", user.id)
        .gte("appointment_date", format(startDate, 'yyyy-MM-dd'))
        .lte("appointment_date", format(endDate, 'yyyy-MM-dd'))
        .eq("status", "completed"); // Only completed appointments generate commission

      if (appointmentsError) throw appointmentsError;

      // Fetch all barbers (profiles with role 'barbeiro')
      const { data: barbersData, error: barbersError } = await supabase
        .from("profiles")
        .select("id, display_name, email, user_id, role, active, specializations")
        .eq("role", "barbeiro");

      if (barbersError) throw barbersError;

      const barbers: Barber[] = (barbersData || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.display_name || profile.email || 'Barbeiro Desconhecido',
        email: profile.email || '',
        role: 'barbeiro',
        active: profile.active ?? true,
        specializations: profile.specializations || []
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
      // Handle joined data - can be array or single object
      const service = Array.isArray(apt.services) ? apt.services[0] : apt.services;
      const barberProfile = Array.isArray(apt.barber_profile) ? apt.barber_profile[0] : apt.barber_profile;
      const client = Array.isArray(apt.clients) ? apt.clients[0] : apt.clients;
      
      const servicePrice = service?.price || 0;
      const commissionAmount = servicePrice * DEFAULT_COMMISSION_RATE;
      const barberName = barberProfile?.display_name || barberProfile?.email || 'Barbeiro Desconhecido';

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
        client_name: client?.name || 'Cliente Desconhecido',
        service_name: service?.name || 'Serviço Desconhecido',
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