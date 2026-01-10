import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types/appointments";

interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  duration_minutes: string;
  active: boolean;
  image_url?: string;
}

export const useServices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchServices = useCallback(async (): Promise<Service[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }, [user]);

  const { data: services, isLoading, error } = useQuery<Service[], Error>({
    queryKey: ["services", user?.id],
    queryFn: fetchServices,
    enabled: !!user,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar serviços",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const addServiceMutation = useMutation<Service, Error, ServiceFormData>({
    mutationFn: async (formData) => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from("services")
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes),
          active: formData.active,
          image_url: formData.image_url || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", user?.id] });
      toast({ title: "Serviço criado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao criar serviço",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation<Service, Error, { id: string; formData: ServiceFormData }>({
    mutationFn: async ({ id, formData }) => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from("services")
        .update({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes),
          active: formData.active,
          image_url: formData.image_url || null,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", user?.id] });
      toast({ title: "Serviço atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar serviço",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", user?.id] });
      toast({ title: "Serviço excluído com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao excluir serviço",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    services: services || [],
    isLoading,
    addService: addServiceMutation.mutateAsync,
    updateService: updateServiceMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,
  };
};