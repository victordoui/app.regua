import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PlanFormData, SubscriptionFormData, SubscriptionPlan, UserSubscription, Client } from "@/types/subscriptions";

export const useSubscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [plansRes, subscriptionsRes, clientsRes] = await Promise.all([
        supabase.from("subscription_plans").select("*").order("price", { ascending: true }),
        supabase.from("user_subscriptions").select(`
          *,
          subscription_plans (*),
          clients (*)
        `).order("created_at", { ascending: false }),
      ]);

      setPlans(plansRes.data as SubscriptionPlan[] || []);
      setSubscriptions(subscriptionsRes.data as UserSubscription[] || []);
      setClients(clientsRes.data as Client[] || []);
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
  }, [toast, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ... rest of the hook logic
};

export { useSubscriptions };