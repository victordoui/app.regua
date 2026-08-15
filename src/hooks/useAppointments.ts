import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";
import { Appointment, AppointmentFormData, Barber, Client, Service, RecurrenceType } from "@/types/appointments";
import { translateBookingError } from "@/lib/bookingErrors";
import { format, addWeeks, addMonths, isBefore, parseISO } from "date-fns";

interface SavedAppointmentResult {
  id: string;
  date: string;
  time: string;
}

interface SaveAppointmentsResult {
  appointments: SavedAppointmentResult[];
  totalPrice: number;
  durationMinutes: number;
}

// Helper function to calculate recurrence dates
const calculateRecurrenceDates = (
  startDate: string,
  endDate: string,
  recurrenceType: RecurrenceType
): string[] => {
  if (!recurrenceType || !endDate) return [startDate];
  
  const dates: string[] = [startDate];
  let currentDate = parseISO(startDate);
  const finalDate = parseISO(endDate);
  
  while (true) {
    if (recurrenceType === 'weekly') {
      currentDate = addWeeks(currentDate, 1);
    } else if (recurrenceType === 'biweekly') {
      currentDate = addWeeks(currentDate, 2);
    } else if (recurrenceType === 'monthly') {
      currentDate = addMonths(currentDate, 1);
    }
    
    if (isBefore(currentDate, finalDate) || format(currentDate, 'yyyy-MM-dd') === endDate) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
    } else {
      break;
    }
    
    // Safety limit - max 52 occurrences
    if (dates.length >= 52) break;
  }
  
  return dates;
};

export const useAppointments = () => {
  const { user } = useAuth();
  const { businessId } = useRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateAppointments = useCallback(() => {
    // A agenda usa chaves como ["appointments", "calendar", status].
    // Invalidar pelo prefixo mantém todas as visões sincronizadas.
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }, [queryClient]);

  useEffect(() => {
    if (!user || !businessId) return;

    const channel = supabase
      .channel(`appointments-calendar-${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `user_id=eq.${businessId}`,
        },
        invalidateAppointments,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, invalidateAppointments, user]);

  const fetchAppointments = useCallback(async (date?: Date, statusFilter: string = 'all'): Promise<Appointment[]> => {
    if (!user || !businessId) return [];

    let query = supabase
      .from("appointments")
      .select("*")
      .eq("user_id", businessId)
      .order("appointment_time", { ascending: true });

    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      query = query.eq("appointment_date", formattedDate);
    }

    if (statusFilter !== 'all') {
      query = query.eq("status", statusFilter);
    }

    const { data: appointmentRows, error } = await query;

    if (error) throw error;
    if (!appointmentRows?.length) return [];

    // Os FKs atuais relacionam client_id com `clients`; barbeiro_id não tem
    // relacionamento PostgREST no schema gerado. Carregar as relações em
    // consultas separadas evita que um embed inválido derrube toda a agenda.
    const appointmentIds = appointmentRows.map(item => item.id);
    const clientIds = [...new Set(appointmentRows.map(item => item.client_id).filter(Boolean))];
    const barberIds = [...new Set(appointmentRows.map(item => item.barbeiro_id).filter(Boolean))] as string[];

    const [clientsResult, appointmentServicesResult, barbersResult] = await Promise.all([
      clientIds.length
        ? supabase.from("clients").select("id, name, email, phone").in("id", clientIds)
        : Promise.resolve({ data: [], error: null }),
      appointmentIds.length
        ? supabase.from("appointment_services").select("id, appointment_id, service_id, price, created_at").in("appointment_id", appointmentIds)
        : Promise.resolve({ data: [], error: null }),
      barberIds.length
        ? supabase.from("profiles").select("id, user_id, full_name:display_name, email, phone, role, active").in("id", barberIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const serviceIds = [...new Set([
      ...appointmentRows.map(item => item.service_id),
      ...(appointmentServicesResult.data || []).map(item => item.service_id),
    ].filter(Boolean))];
    const servicesResult = serviceIds.length
      ? await supabase.from("services").select("id, name, description, price, duration_minutes, active").in("id", serviceIds)
      : { data: [], error: null };

    // Dados complementares não devem esconder o agendamento. Caso uma
    // política de leitura restrinja cliente/profissional, o cartão continua
    // visível e usa os fallbacks da interface.
    if (clientsResult.error) console.warn("Não foi possível carregar clientes da agenda:", clientsResult.error);
    if (appointmentServicesResult.error) console.warn("Não foi possível carregar os serviços vinculados da agenda:", appointmentServicesResult.error);
    if (servicesResult.error) console.warn("Não foi possível carregar serviços da agenda:", servicesResult.error);
    if (barbersResult.error) console.warn("Não foi possível carregar profissionais da agenda:", barbersResult.error);

    const clientsById = new Map((clientsResult.data || []).map(item => [item.id, item]));
    const servicesById = new Map((servicesResult.data || []).map(item => [item.id, item]));
    const barbersById = new Map((barbersResult.data || []).map(item => [item.id, item]));
    const appointmentServicesByAppointment = new Map<string, typeof appointmentServicesResult.data>();
    for (const item of appointmentServicesResult.data || []) {
      const current = appointmentServicesByAppointment.get(item.appointment_id) || [];
      current.push(item);
      appointmentServicesByAppointment.set(item.appointment_id, current);
    }

    return appointmentRows.map(appointment => {
      const serviceLinks = appointmentServicesByAppointment.get(appointment.id) || [];
      const linkedServices = serviceLinks
        .map(link => servicesById.get(link.service_id))
        .filter(Boolean);
      const primaryService = servicesById.get(appointment.service_id);
      const visibleServices = linkedServices.length > 0
        ? linkedServices
        : primaryService ? [primaryService] : [];
      const displayService = visibleServices.length > 1
        ? {
            ...visibleServices[0],
            name: visibleServices.map(service => service!.name).join(" + "),
            description: visibleServices.map(service => service!.description).filter(Boolean).join("; "),
            price: visibleServices.reduce((total, service) => total + Number(service!.price), 0),
            duration_minutes: visibleServices.reduce((total, service) => total + service!.duration_minutes, 0),
          }
        : visibleServices[0];

      return {
        ...appointment,
        clients: clientsById.get(appointment.client_id),
        services: displayService,
        appointment_services: serviceLinks.map(link => ({
          ...link,
          services: servicesById.get(link.service_id),
        })),
        barbers: appointment.barbeiro_id ? barbersById.get(appointment.barbeiro_id) : undefined,
      };
    }) as unknown as Appointment[];
  }, [businessId, user]);

  const fetchClients = useCallback(async (): Promise<Client[]> => {
    if (!user || !businessId) return [];
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email, phone, notes, created_at")
      .eq("user_id", businessId)
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  }, [businessId, user]);

  const fetchServices = useCallback(async (): Promise<Service[]> => {
    if (!user || !businessId) return [];
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", businessId)
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  }, [businessId, user]);

  const fetchBarbers = useCallback(async (): Promise<Barber[]> => {
    if (!user || !businessId) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name:display_name, email, phone, role")
      .eq("user_id", businessId)
      .eq("role", "barbeiro") // Filter for profiles with 'barbeiro' role
      .order("display_name", { ascending: true });
    if (error) throw error;
    return data || [];
  }, [businessId, user]);

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[], Error>({
    queryKey: ["clients", businessId],
    queryFn: fetchClients,
    enabled: !!user && !!businessId,
  });

  const { data: services, isLoading: isLoadingServices, error: servicesError } = useQuery<Service[], Error>({
    queryKey: ["services", businessId],
    queryFn: fetchServices,
    enabled: !!user && !!businessId,
  });

  const { data: barbers, isLoading: isLoadingBarbers, error: barbersError } = useQuery<Barber[], Error>({
    queryKey: ["barbers", businessId],
    queryFn: fetchBarbers,
    enabled: !!user && !!businessId,
  });

  useEffect(() => {
    if (clientsError || servicesError || barbersError) {
      toast({
        title: "Erro ao carregar dados",
        description: clientsError?.message || servicesError?.message || barbersError?.message,
        variant: "destructive",
      });
    }
  }, [clientsError, servicesError, barbersError, toast]);

  const addAppointmentMutation = useMutation<Appointment[], Error, AppointmentFormData>({
    mutationFn: async (formData) => {
      if (!user || !businessId) throw new Error("Usuário não autenticado.");
      if (!formData.barbeiro_id) throw new Error("PROFESSIONAL_REQUIRED");

      const serviceIds = [...new Set(
        formData.service_ids?.length ? formData.service_ids : [formData.service_id],
      )].filter(Boolean);
      if (serviceIds.length === 0) throw new Error("INVALID_SERVICE");
      
      // Calculate all dates for recurring appointments
      const appointmentDates = calculateRecurrenceDates(
        formData.appointment_date,
        formData.recurrence_end_date || formData.appointment_date,
        formData.recurrence_type || null
      );

      const { data, error } = await supabase.rpc("save_business_appointments", {
        _client_id: formData.client_id,
        _service_ids: serviceIds,
        _barber_id: formData.barbeiro_id,
        _appointment_dates: appointmentDates,
        _appointment_time: formData.appointment_time,
        _notes: formData.notes || null,
        _recurrence_type: formData.recurrence_type || null,
        _recurrence_end_date: formData.recurrence_end_date || null,
        _appointment_id: null,
        _series_scope: "single",
      });

      if (error) throw error;
      const result = data as unknown as SaveAppointmentsResult;
      return result.appointments as unknown as Appointment[];
    },
    onSuccess: (data) => {
      invalidateAppointments();
      const count = data.length;
      toast({ 
        title: count > 1 
          ? `${count} agendamentos criados com sucesso!` 
          : "Agendamento criado com sucesso!" 
      });
    },
    onError: (err) => {
      toast({
        title: "Erro ao criar agendamento",
        description: translateBookingError(err.message).message,
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation<Appointment, Error, { id: string; formData: AppointmentFormData }>({
    mutationFn: async ({ id, formData }) => {
      if (!user || !businessId) throw new Error("Usuário não autenticado.");
      if (!formData.barbeiro_id) throw new Error("PROFESSIONAL_REQUIRED");
      const serviceIds = [...new Set(
        formData.service_ids?.length ? formData.service_ids : [formData.service_id],
      )].filter(Boolean);
      const { data, error } = await supabase.rpc("save_business_appointments", {
        _client_id: formData.client_id,
        _service_ids: serviceIds,
        _barber_id: formData.barbeiro_id,
        _appointment_dates: [formData.appointment_date],
        _appointment_time: formData.appointment_time,
        _notes: formData.notes || null,
        _recurrence_type: formData.recurrence_type || null,
        _recurrence_end_date: formData.recurrence_end_date || null,
        _appointment_id: id,
        _series_scope: "single",
      });

      if (error) throw error;
      const result = data as unknown as SaveAppointmentsResult;
      return result.appointments[0] as unknown as Appointment;
    },
    onSuccess: () => {
      invalidateAppointments();
      toast({ title: "Agendamento atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar agendamento",
        description: translateBookingError(err.message).message,
        variant: "destructive",
      });
    },
  });

  const updateAppointmentStatusMutation = useMutation<Appointment, Error, { id: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' }>({
    mutationFn: async ({ id, status }) => {
      if (!user || !businessId) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id)
        .eq("user_id", businessId)
        .select()
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      invalidateAppointments();
      toast({ title: "Status do agendamento atualizado!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar status",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation<void, Error, { id: string; deleteAll?: boolean }>({
    mutationFn: async ({ id, deleteAll }) => {
      if (!user || !businessId) throw new Error("Usuário não autenticado.");
      
      if (deleteAll) {
        // Get the appointment to check if it's a parent or child
        const { data: appointment, error: appointmentError } = await supabase
          .from("appointments")
          .select("parent_appointment_id")
          .eq("user_id", businessId)
          .eq("id", id)
          .single();

        if (appointmentError) throw appointmentError;
        
        const parentId = appointment?.parent_appointment_id || id;
        
        // Delete all related appointments (children and parent)
        const { error } = await supabase
          .from("appointments")
          .delete()
          .or(`id.eq.${parentId},parent_appointment_id.eq.${parentId}`)
          .eq("user_id", businessId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("appointments")
          .delete()
          .eq("id", id)
          .eq("user_id", businessId);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      invalidateAppointments();
      toast({ 
        title: variables.deleteAll 
          ? "Todos os agendamentos da série excluídos!" 
          : "Agendamento excluído com sucesso!" 
      });
    },
    onError: (err) => {
      toast({
        title: "Erro ao excluir agendamento",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update an entire series of recurring appointments
  const updateSeriesMutation = useMutation<Appointment[], Error, { 
    id: string; 
    formData: Partial<AppointmentFormData>;
    updateFutureOnly?: boolean;
  }>({
    mutationFn: async ({ id, formData, updateFutureOnly = true }) => {
      if (!user || !businessId) throw new Error("Usuário não autenticado.");
      
      if (!formData.client_id || !formData.barbeiro_id || !formData.appointment_time) {
        throw new Error("INVALID_APPOINTMENT");
      }
      const serviceIds = [...new Set(
        formData.service_ids?.length
          ? formData.service_ids
          : formData.service_id ? [formData.service_id] : [],
      )].filter(Boolean);
      if (serviceIds.length === 0) throw new Error("INVALID_SERVICE");

      const { data, error } = await supabase.rpc("save_business_appointments", {
        _client_id: formData.client_id,
        _service_ids: serviceIds,
        _barber_id: formData.barbeiro_id,
        _appointment_dates: formData.appointment_date ? [formData.appointment_date] : [],
        _appointment_time: formData.appointment_time,
        _notes: formData.notes || null,
        _recurrence_type: formData.recurrence_type || null,
        _recurrence_end_date: formData.recurrence_end_date || null,
        _appointment_id: id,
        _series_scope: updateFutureOnly ? "future" : "single",
      });

      if (error) throw error;
      const result = data as unknown as SaveAppointmentsResult;
      return result.appointments as unknown as Appointment[];
    },
    onSuccess: (data) => {
      invalidateAppointments();
      toast({ 
        title: `${data.length} agendamentos da série atualizados!` 
      });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar série",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    appointmentsScopeId: businessId,
    clients: clients || [],
    services: services || [],
    barbers: barbers || [],
    isLoadingClients,
    isLoadingServices,
    isLoadingBarbers,
    fetchAppointments,
    addAppointment: addAppointmentMutation.mutateAsync,
    updateAppointment: updateAppointmentMutation.mutateAsync,
    updateAppointmentStatus: updateAppointmentStatusMutation.mutateAsync,
    deleteAppointment: (id: string, deleteAll?: boolean) => deleteAppointmentMutation.mutateAsync({ id, deleteAll }),
    updateAppointmentSeries: updateSeriesMutation.mutateAsync,
  };
};
