import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Barber } from "@/types/appointments";

interface BarberFormData {
  full_name: string;
  email: string;
  phone: string;
  specializations: string; // comma separated string
  active: boolean;
}

export const useBarbers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchBarbers = useCallback(async (): Promise<Barber[]> => {
    if (!user) return [];
    
    // Fetch profiles managed by the current user that have the role 'barbeiro'
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name:display_name, email, phone, role, active, specializations")
      .eq("user_id", user.id)
      .eq("role", "barbeiro")
      .order("display_name", { ascending: true });

    if (error) throw error;
    return data.map(d => ({
      ...d,
      full_name: d.full_name || d.email || 'Barbeiro Desconhecido',
      // Assuming 'specializations' is stored as a text array or similar in the DB
      specializations: d.specializations || [],
    })) as Barber[] || [];
  }, [user]);

  const { data: barbers, isLoading, error } = useQuery<Barber[], Error>({
    queryKey: ["barbers", user?.id],
    queryFn: fetchBarbers,
    enabled: !!user,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar barbeiros",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const addBarberMutation = useMutation<Barber, Error, BarberFormData>({
    mutationFn: async (formData) => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const specializationsArray = formData.specializations.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          display_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: 'barbeiro',
          active: formData.active,
          // Note: Supabase expects array for text[] column
          specializations: specializationsArray, 
        })
        .select("id, user_id, full_name:display_name, email, phone, role, active, specializations")
        .single();

      if (error) throw error;
      return data as Barber;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers", user?.id] });
      toast({ title: "Barbeiro cadastrado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao cadastrar barbeiro",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateBarberMutation = useMutation<Barber, Error, { id: string; formData: BarberFormData }>({
    mutationFn: async ({ id, formData }) => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const specializationsArray = formData.specializations.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          active: formData.active,
          specializations: specializationsArray,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id, user_id, full_name:display_name, email, phone, role, active, specializations")
        .single();

      if (error) throw error;
      return data as Barber;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers", user?.id] });
      toast({ title: "Barbeiro atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar barbeiro",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const toggleBarberStatusMutation = useMutation<Barber, Error, { id: string; currentStatus: boolean }>({
    mutationFn: async ({ id, currentStatus }) => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from("profiles")
        .update({ active: !currentStatus })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id, user_id, full_name:display_name, email, phone, role, active, specializations")
        .single();

      if (error) throw error;
      return data as Barber;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["barbers", user?.id] });
      toast({ title: `Barbeiro ${data.active ? 'ativado' : 'desativado'} com sucesso!` });
    },
    onError: (err) => {
      toast({
        title: "Erro ao alterar status",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    barbers: barbers || [],
    isLoading,
    addBarber: addBarberMutation.mutateAsync,
    updateBarber: updateBarberMutation.mutateAsync,
    toggleBarberStatus: toggleBarberStatusMutation.mutateAsync,
  };
};