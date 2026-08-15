import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/types/appointments"; // Reusing Client type

interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const useClients = () => {
  const { user } = useAuth();
  const { businessId } = useRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchClients = useCallback(async (): Promise<Client[]> => {
    if (!user || !businessId) return [];

    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email, phone, notes, created_at")
      .eq("user_id", businessId)
      .order("name", { ascending: true });

    if (error) throw error;
    return (data || []) as Client[];
  }, [businessId, user]);

  const { data: clients, isLoading, error } = useQuery<Client[], Error>({
    queryKey: ["clients", businessId],
    queryFn: fetchClients,
    enabled: !!user && !!businessId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const addClientMutation = useMutation<Client, Error, ClientFormData>({
    mutationFn: async (formData) => {
      if (!user || !businessId) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: businessId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
        })
        .select("id, name, email, phone, notes, created_at")
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", businessId] });
      toast({ title: "Cliente cadastrado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao cadastrar cliente",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation<Client, Error, { id: string; formData: ClientFormData }>({
    mutationFn: async ({ id, formData }) => {
      if (!user || !businessId) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from("clients")
        .update({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
        })
        .eq("id", id)
        .eq("user_id", businessId)
        .select("id, name, email, phone, notes, created_at")
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", businessId] });
      toast({ title: "Cliente atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!user || !businessId) throw new Error("Usuário não autenticado.");
      
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id)
        .eq("user_id", businessId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", businessId] });
      toast({ title: "Cliente excluído com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao excluir cliente",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    clients: clients || [],
    isLoading,
    addClient: addClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
  };
};
