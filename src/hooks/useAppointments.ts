import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Appointment, AppointmentFormData, Barber, Client, Service } from "@/types/appointments";
import { format } from "date-fns";

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

  const addAppointmentMutation = useMutation<Appointment, Error, AppointmentFormData>({
    mutationFn: async (formData) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          client_id: formData.client_id,
          service_id: formData.service_id,
          barbeiro_id: formData.barbeiro_id,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          notes: formData.notes,
          status: 'pending', // Default status
          total_price: services?.find(s => s.id === formData.service_id)?.price || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
      toast({ title: "Agendamento criado com sucesso!" });
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

  const updateAppointmentStatusMutation = useMutation<Appointment, Error, { id: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled' }>({
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

  const deleteAppointmentMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
      toast({ title: "Agendamento excluído com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao excluir agendamento",
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
    fetchAppointments, // Expose fetch function for specific date/filter
    addAppointment: addAppointmentMutation.mutateAsync,
    updateAppointment: updateAppointmentMutation.mutateAsync,
    updateAppointmentStatus: updateAppointmentStatusMutation.mutateAsync,
    deleteAppointment: deleteAppointmentMutation.mutateAsync,
  };
};