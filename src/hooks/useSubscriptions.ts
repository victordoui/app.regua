import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { PlanFormData, SubscriptionFormData, SubscriptionPlan, UserSubscription, Client } from "@/types/subscriptions";

export const useSubscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data for now
      setPlans([
        {
          id: '1',
          name: 'Plano Básico',
          description: 'Acesso básico',
          price: 29.90,
          billing_cycle: 'monthly',
          features: ['Corte simples', 'Sem fila'],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      
      setSubscriptions([
        {
          id: '1',
          client_id: '1',
          plan_id: '1',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      
      setClients([
        {
          id: '1',
          name: 'Cliente Teste',
          email: 'teste@email.com',
          phone: '11999999999',
          created_at: new Date().toISOString()
        }
      ]);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createPlan = useCallback(async (formData: PlanFormData) => {
    try {
      const newPlan: SubscriptionPlan = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        billing_cycle: formData.billing_cycle,
        features: formData.features,
        active: formData.active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setPlans(prev => [newPlan, ...prev]);
      toast({
        title: "Plano criado com sucesso!",
      });
    } catch (error: any) {
      console.error("Error creating plan:", error);
      toast({
        title: "Erro ao criar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const createSubscription = useCallback(async (formData: SubscriptionFormData) => {
    try {
      const newSubscription: UserSubscription = {
        id: Date.now().toString(),
        client_id: formData.client_id,
        plan_id: formData.plan_id,
        status: 'active',
        start_date: formData.start_date,
        end_date: new Date(new Date(formData.start_date).setMonth(new Date(formData.start_date).getMonth() + 1)).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setSubscriptions(prev => [newSubscription, ...prev]);
      toast({
        title: "Assinatura criada com sucesso!",
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Erro ao criar assinatura",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const updateSubscriptionStatus = useCallback(async (subscriptionId: string, newStatus: string) => {
    try {
      setSubscriptions(prev => 
        prev.map(sub => sub.id === subscriptionId ? { ...sub, status: newStatus } : sub)
      );
      toast({
        title: "Status atualizado com sucesso!",
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const getStats = useCallback(() => {
    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const mrr = subscriptions.reduce((sum, sub) => sum + (plans.find(p => p.id === sub.plan_id)?.price || 0), 0);
    const retention = subscriptions.length > 0 ? Math.round((activeCount / subscriptions.length) * 100) : 0;
    return { activeCount, mrr, retention };
  }, [subscriptions, plans]);

  return {
    plans,
    subscriptions,
    clients,
    createPlan,
    createSubscription,
    updateSubscriptionStatus,
    getStats,
    fetchData
  };
};