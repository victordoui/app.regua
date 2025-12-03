import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PlanFormData, SubscriptionFormData, SubscriptionPlan, UserSubscription, Client } from "@/types/subscriptions";
import { addMonths, addYears, format } from "date-fns";

export const useSubscriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchSubscriptionData = useCallback(async () => {
    if (!user) return { plans: [], subscriptions: [], clients: [] };

    try {
      const [plansRes, subscriptionsRes, clientsRes] = await Promise.all([
        supabase.from("subscription_plans").select("*").order("price", { ascending: true }),
        supabase.from("user_subscriptions").select(`
          *,
          subscription_plans (*),
          clients:profiles (id, display_name, email, phone)
        `).eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name, email, phone").eq("user_id", user.id),
      ]);

      if (plansRes.error) throw plansRes.error;
      if (subscriptionsRes.error) throw subscriptionsRes.error;
      if (clientsRes.error) throw clientsRes.error;

      // Map subscriptions to include proper client name
      const mappedSubscriptions = (subscriptionsRes.data || []).map(sub => ({
        ...sub,
        clients: sub.clients ? {
          ...sub.clients,
          name: sub.clients.display_name || sub.clients.email || 'Cliente'
        } : null
      }));

      return {
        plans: plansRes.data as SubscriptionPlan[] || [],
        subscriptions: mappedSubscriptions as UserSubscription[] || [],
        clients: clientsRes.data as Client[] || [],
      };
    } catch (error: any) {
      console.error("Error fetching subscription data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
      return { plans: [], subscriptions: [], clients: [] };
    }
  }, [user, toast]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["subscriptions", user?.id],
    queryFn: fetchSubscriptionData,
    enabled: !!user,
    initialData: { plans: [], subscriptions: [], clients: [] },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar assinaturas",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const createPlanMutation = useMutation<SubscriptionPlan, Error, PlanFormData>({
    mutationFn: async (formData) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("subscription_plans")
        .insert({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          billing_cycle: formData.billing_cycle as 'monthly' | 'yearly',
          features: formData.features,
          active: formData.active,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", user?.id] });
      toast({ title: "Plano criado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao criar plano",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation<SubscriptionPlan, Error, { id: string; formData: PlanFormData }>({
    mutationFn: async ({ id, formData }) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("subscription_plans")
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          billing_cycle: formData.billing_cycle as 'monthly' | 'yearly',
          features: formData.features,
          active: formData.active,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", user?.id] });
      toast({ title: "Plano atualizado com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar plano",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const togglePlanStatusMutation = useMutation<SubscriptionPlan, Error, { id: string; currentStatus: boolean }>({
    mutationFn: async ({ id, currentStatus }) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("subscription_plans")
        .update({ active: !currentStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", user?.id] });
      toast({ title: `Plano ${data.active ? 'ativado' : 'desativado'} com sucesso!` });
    },
    onError: (err) => {
      toast({
        title: "Erro ao alterar status do plano",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const createSubscriptionMutation = useMutation<UserSubscription, Error, SubscriptionFormData>({
    mutationFn: async (formData) => {
      if (!user) throw new Error("Usuário não autenticado.");

      const selectedPlan = data.plans.find(p => p.id === formData.plan_id);
      if (!selectedPlan) throw new Error("Plano não encontrado.");

      const startDate = new Date(formData.start_date);
      let endDate: Date;
      if (selectedPlan.billing_cycle === 'monthly') {
        endDate = addMonths(startDate, 1);
      } else {
        endDate = addYears(startDate, 1);
      }

      const { data: newSubscription, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          client_id: formData.client_id,
          plan_id: formData.plan_id,
          start_date: formData.start_date,
          end_date: format(endDate, 'yyyy-MM-dd'),
          status: 'active',
          credits_remaining: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return newSubscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", user?.id] });
      toast({ title: "Assinatura criada com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao criar assinatura",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const updateSubscriptionStatusMutation = useMutation<UserSubscription, Error, { id: string; status: 'active' | 'cancelled' | 'paused' | 'expired' }>({
    mutationFn: async ({ id, status }) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const { data, error } = await supabase
        .from("user_subscriptions")
        .update({ status })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", user?.id] });
      toast({ title: `Assinatura ${data.status} com sucesso!` });
    },
    onError: (err) => {
      toast({
        title: "Erro ao atualizar status da assinatura",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const getStats = useCallback(() => {
    const activeCount = data.subscriptions.filter(s => s.status === 'active').length;
    const mrr = data.subscriptions.reduce((sum, sub) => sum + (data.plans.find(p => p.id === sub.plan_id)?.price || 0), 0);
    const totalSubscriptions = data.subscriptions.length;
    const retention = totalSubscriptions > 0 ? Math.round((activeCount / totalSubscriptions) * 100) : 0;
    return { activeCount, mrr, retention };
  }, [data.subscriptions, data.plans]);

  return {
    plans: data.plans,
    subscriptions: data.subscriptions,
    clients: data.clients,
    isLoading,
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    togglePlanStatus: togglePlanStatusMutation.mutateAsync,
    createSubscription: createSubscriptionMutation.mutateAsync,
    updateSubscriptionStatus: updateSubscriptionStatusMutation.mutateAsync,
    getStats,
  };
};