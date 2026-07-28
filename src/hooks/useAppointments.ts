import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Appointment, AppointmentFormData, Barber, Client, Service, RecurrenceType } from "@/types/appointments";
import { translateBookingError } from "@/lib/bookingErrors";
import { format, addWeeks, addMonths, isBefore, parseISO } from "date-fns";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateAppointments = useCallback(() => {
    // A agenda usa chaves como ["appointments", "calendar", status].
    // Invalidar pelo prefixo mantém todas as visões sincronizadas.
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }, [queryClient]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`appointments-calendar-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `user_id=eq.${user.id}`,
        },
        invalidateAppointments,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invalidateAppointments, user]);

  const fetchAppointments = useCallback(async (date?: Date, statusFilter: string = 'all'): Promise<Appointment[]> => {
    if (!user) return [];

    let query = supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user.id)
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
  }, [user]);

  const fetchClients = useCallback(async (): Promise<Client[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email, phone, notes, created_at")
      .eq("user_id", user.id)
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  }, [user]);

  const fetchServices = useCallback(async (): Promise<Service[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  }, [user]);

  const fetchBarbers = useCallback(async (): Promise<Barber[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name:display_name, email, phone, role")
      .eq("user_id", user.id) // Assuming barbers are also managed by the current user
      .eq("role", "barbeiro") // Filter for profiles with 'barbeiro' role
      .order("display_name", { ascending: true });
    if (error) throw error;
    return data || [];
  }, [user]);

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[], Error>({
    queryKey: ["clients", user?.id],
    queryFn: fetchClients,
    enabled: !!user,
  });

  const { data: services, isLoading: isLoadingServices, error: servicesError } = useQuery<Service[], Error>({
    queryKey: ["services", user?.id],
    queryFn: fetchServices,
    enabled: !!user,
  });

  const { data: barbers, isLoading: isLoadingBarbers, error: barbersError } = useQuery<Barber[], Error>({
    queryKey: ["barbers", user?.id],
    queryFn: fetchBarbers,
    enabled: !!user,
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
      if (!user) throw new Error("Usuário não autenticado.");
      
      // Calculate total price from all services
      const serviceIds = formData.service_ids?.length ? formData.service_ids : [formData.service_id];
      const selectedServices = services?.filter(s => serviceIds.includes(s.id)) || [];
      const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
      
      // Calculate all dates for recurring appointments
      const appointmentDates = calculateRecurrenceDates(
        formData.appointment_date,
        formData.recurrence_end_date || formData.appointment_date,
        formData.recurrence_type || null
      );

      // Bloqueia sobreposição com atendimentos já existentes do mesmo profissional.
      if (formData.barbeiro_id) {
        const newDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0) || 30;
        const { data: sameDay } = await supabase
          .from("appointments")
          .select("appointment_time, service_id, appointment_services(service_id)")
          .eq("user_id", user.id)
          .eq("barbeiro_id", formData.barbeiro_id)
          .in("appointment_date", appointmentDates)
          .neq("status", "cancelled");

        const durationOf = (row: { service_id: string; appointment_services?: { service_id: string }[] }) => {
          const ids = row.appointment_services?.length
            ? row.appointment_services.map(item => item.service_id)
            : [row.service_id];
          const total = ids.reduce((sum, id) => sum + (services?.find(s => s.id === id)?.duration_minutes || 0), 0);
          return total || 30;
        };

        const hasOverlap = (sameDay || []).some(row =>
          appointmentsConflict(
            minutesFromTime(formData.appointment_time),
            newDuration,
            minutesFromTime(row.appointment_time),
            durationOf(row),
          ),
        );

        if (hasOverlap) {
          throw new Error("SLOT_UNAVAILABLE");
        }
      }

      // Create the first (parent) appointment
      const { data: parentAppointment, error: parentError } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          client_id: formData.client_id,
          service_id: formData.service_id || serviceIds[0], // Primary service for backward compat
          barbeiro_id: formData.barbeiro_id,
          appointment_date: appointmentDates[0],
          appointment_time: formData.appointment_time,
          notes: formData.notes,
          status: 'pending',
          total_price: totalPrice,
          recurrence_type: formData.recurrence_type,
          recurrence_end_date: formData.recurrence_end_date,
        })
        .select()
        .single();

      if (parentError) throw parentError;
      
      // Insert into appointment_services for multi-service support
      if (serviceIds.length > 0) {
        const appointmentServices = selectedServices.map(service => ({
          appointment_id: parentAppointment.id,
          service_id: service.id,
          price: service.price
        }));
        
        const { error: servicesError } = await supabase
          .from("appointment_services")
          .insert(appointmentServices);
        
        if (servicesError) console.error("Error inserting appointment services:", servicesError);
      }
      
      const createdAppointments: Appointment[] = [parentAppointment as Appointment];
      
      // Create child appointments if recurring
      if (appointmentDates.length > 1) {
        const childAppointments = appointmentDates.slice(1).map(date => ({
          user_id: user.id,
          client_id: formData.client_id,
          service_id: formData.service_id || serviceIds[0],
          barbeiro_id: formData.barbeiro_id,
          appointment_date: date,
          appointment_time: formData.appointment_time,
          notes: formData.notes,
          status: 'pending' as const,
          total_price: totalPrice,
          recurrence_type: formData.recurrence_type,
          recurrence_end_date: formData.recurrence_end_date,
          parent_appointment_id: parentAppointment.id,
        }));
        
        const { data: childData, error: childError } = await supabase
          .from("appointments")
          .insert(childAppointments)
          .select();
        
        if (childError) throw childError;
        
        // Insert appointment_services for each child appointment
        if (childData && serviceIds.length > 0) {
          for (const child of childData) {
            const childServices = selectedServices.map(service => ({
              appointment_id: child.id,
              service_id: service.id,
              price: service.price
            }));
            
            await supabase.from("appointment_services").insert(childServices);
          }
          createdAppointments.push(...(childData as Appointment[]));
        }
      }

      return createdAppointments;
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
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("appointments")
        .update({
          client_id: formData.client_id,
          service_id: formData.service_id,
          barbeiro_id: formData.barbeiro_id,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          notes: formData.notes,
          total_price: services?.find(s => s.id === formData.service_id)?.price || 0,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Appointment;
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
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id)
        .eq("user_id", user.id)
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
      if (!user) throw new Error("Usuário não autenticado.");
      
      if (deleteAll) {
        // Get the appointment to check if it's a parent or child
        const { data: appointment } = await supabase
          .from("appointments")
          .select("parent_appointment_id")
          .eq("id", id)
          .single();
        
        const parentId = appointment?.parent_appointment_id || id;
        
        // Delete all related appointments (children and parent)
        await supabase
          .from("appointments")
          .delete()
          .or(`id.eq.${parentId},parent_appointment_id.eq.${parentId}`)
          .eq("user_id", user.id);
      } else {
        const { error } = await supabase
          .from("appointments")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

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
      if (!user) throw new Error("Usuário não autenticado.");
      
      // Get the appointment to find the parent
      const { data: currentAppointment } = await supabase
        .from("appointments")
        .select("parent_appointment_id, appointment_date")
        .eq("id", id)
        .single();
      
      if (!currentAppointment) throw new Error("Agendamento não encontrado.");
      
      const parentId = currentAppointment.parent_appointment_id || id;
      
      // Fetch all appointments in the series
      const { data: seriesAppointments, error: fetchError } = await supabase
        .from("appointments")
        .select("id, appointment_date")
        .or(`id.eq.${parentId},parent_appointment_id.eq.${parentId}`)
        .eq("user_id", user.id);
      
      if (fetchError) throw fetchError;
      if (!seriesAppointments || seriesAppointments.length === 0) {
        throw new Error("Nenhum agendamento encontrado na série.");
      }
      
      // Filter for future appointments only if requested
      let appointmentsToUpdate = seriesAppointments;
      if (updateFutureOnly) {
        const today = format(new Date(), 'yyyy-MM-dd');
        appointmentsToUpdate = seriesAppointments.filter(apt => apt.appointment_date >= today);
      }
      
      if (appointmentsToUpdate.length === 0) {
        throw new Error("Nenhum agendamento futuro encontrado para atualizar.");
      }
      
      // Prepare update data (exclude appointment_date as each has its own)
      const updateData: Record<string, unknown> = {};
      if (formData.service_id) updateData.service_id = formData.service_id;
      if (formData.barbeiro_id !== undefined) updateData.barbeiro_id = formData.barbeiro_id;
      if (formData.appointment_time) updateData.appointment_time = formData.appointment_time;
      if (formData.notes !== undefined) updateData.notes = formData.notes;
      if (formData.client_id) updateData.client_id = formData.client_id;
      
      // Update price if service changed
      if (formData.service_id) {
        const servicePrice = services?.find(s => s.id === formData.service_id)?.price || 0;
        updateData.total_price = servicePrice;
      }
      
      // Update each appointment
      const ids = appointmentsToUpdate.map(apt => apt.id);
      const { data, error } = await supabase
        .from("appointments")
        .update(updateData)
        .in("id", ids)
        .eq("user_id", user.id)
        .select();
      
      if (error) throw error;
      return (data || []) as Appointment[];
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
    appointmentsScopeId: user?.id ?? null,
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
