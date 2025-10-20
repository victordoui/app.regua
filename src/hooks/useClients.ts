import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchClients = useCallback(async (): Promise<Client[]> => {
    if (!user) return [];
    
    // Fetch profiles associated with the current user (assuming they are the clients/barbers managed by the user)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name:display_name, email, phone, notes, created_at")
      .eq("user_id", user.id)
      .order("display_name", { ascending: true });

    if (error) throw error;
    return data.map(d => ({
      ...d,
      name: d.name || d.email || 'Cliente Desconhecido',
    })) as Client[] || [];
  }, [user]);

  const { data: clients, isLoading, error } = useQuery<Client[], Error>({
    queryKey: ["clients", user?.id],
    queryFn: fetchClients,
    enabled: !!user,
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
      if (!user) throw new Error("Usuário não autenticado.");
      
      // Note: We are inserting into the 'profiles' table.
      // Since this is a client managed by the current user, we need to ensure the profile is linked correctly.
      // For simplicity in this context, we assume the 'profiles' table is used for all managed entities (clients/barbers).
      // In a real scenario, clients might be separate from the user's own profile.
      
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id, // Link the client profile to the managing user
          display_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
          role: 'cliente', // Explicitly set role as client
        })
        .select("id, name:display_name, email, phone, notes, created_at")
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
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
      if (!user) throw new Error("Usuário não autenticado.");
      
      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id, name:display_name, email, phone, notes, created_at")
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
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
      if (!user) throw new Error("Usuário não autenticado.");
      
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
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