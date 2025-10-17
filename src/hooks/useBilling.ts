import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AccountTransaction, AccountTransactionFormData, TransactionStatus, TransactionType } from "@/types/billing";

export const useBilling = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchTransactions = useCallback(async (): Promise<AccountTransaction[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("accounts_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data || [];
  }, [user]);

  const { data: transactions, isLoading, error } = useQuery<AccountTransaction[], Error>({
    queryKey: ["accounts_transactions", user?.id],
    queryFn: fetchTransactions,
    enabled: !!user,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar lançamentos",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const addTransactionMutation = useMutation<AccountTransaction, Error, AccountTransactionFormData>({
    mutationFn: async (formData) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("accounts_transactions")
        .insert({
          user_id: user.id,
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: formData.type,
          due_date: formData.due_date,
          category: formData.category || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts_transactions", user?.id] });
      toast({ title: "Lançamento adicionado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao adicionar lançamento",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateTransactionMutation = useMutation<AccountTransaction, Error, { id: string; formData: AccountTransactionFormData }>({
    mutationFn: async ({ id, formData }) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("accounts_transactions")
        .update({
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: formData.type,
          due_date: formData.due_date,
          category: formData.category || null,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts_transactions", user?.id] });
      toast({ title: "Lançamento atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar lançamento",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateTransactionStatusMutation = useMutation<AccountTransaction, Error, { id: string; status: TransactionStatus }>({
    mutationFn: async ({ id, status }) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("accounts_transactions")
        .update({ status })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts_transactions", user?.id] });
      toast({ title: "Status do lançamento atualizado!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar status",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const deleteTransactionMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { error } = await supabase
        .from("accounts_transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts_transactions", user?.id] });
      toast({ title: "Lançamento excluído com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao excluir lançamento",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    transactions: transactions || [],
    isLoading,
    addTransaction: addTransactionMutation.mutateAsync,
    updateTransaction: updateTransactionMutation.mutateAsync,
    updateTransactionStatus: updateTransactionStatusMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
  };
};