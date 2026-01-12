import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Appointment, AppointmentFormData, Barber, Client, Service, RecurrenceType } from "@/types/appointments";
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

  const fetchAppointments = useCallback(async (date?: Date, statusFilter: string = 'all'): Promise<Appointment[]> => {
    if (!user) return [];

    let query = supabase
      .from("appointments")
      .select(`
        *,
        clients:profiles!client_id (id, name:display_name, email, phone),
        services (id, name, description, price, duration_minutes, active),
        barbers:profiles!barbeiro_id (id, user_id, full_name:display_name, email, phone, role)
      `)
      .eq("user_id", user.id)
      .order("appointment_time", { ascending: true });

    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      query = query.eq("appointment_date", formattedDate);
    }

    if (statusFilter !== 'all') {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }, [user]);

  const fetchClients = useCallback(async (): Promise<Client[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name:display_name, email, phone, created_at")
      .eq("user_id", user.id) // Fetch clients associated with the current user
      .order("display_name", { ascending: true });
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
      
      const createdAppointments: Appointment[] = [parentAppointment];
      
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
          createdAppointments.push(...childData);
        }
      }

      return createdAppointments;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
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
        description: err.message,
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
      toast({ title: "Agendamento atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar agendamento",
        description: err.message,
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
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
      return data || [];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
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
