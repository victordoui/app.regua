import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard, Users, TrendingUp, DollarSign, Calendar, Plus, Crown, Star,
  CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { SubscriptionPlan } from '@/types/subscriptions';
import Layout from '@/components/Layout';
import SubscriptionPlanCard from '@/components/subscriptions/SubscriptionPlanCard';
import UserSubscriptionCard from '@/components/subscriptions/UserSubscriptionCard';
import SubscriptionFormDialog from '@/components/subscriptions/SubscriptionFormDialog';
import SubscriptionCreationDialog from '@/components/subscriptions/SubscriptionCreationDialog';

const Subscriptions = () => {
  const {
    plans,
    subscriptions,
    clients,
    isLoading,
    createPlan,
    updatePlan,
    togglePlanStatus,
    createSubscription,
    updateSubscriptionStatus,
    getStats
  } = useSubscriptions();

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const handleSavePlan = async (formData: any, id: string | null) => {
    if (id) {
      await updatePlan({ id, formData });
    } else {
      await createPlan(formData);
    }
  };

  const stats = getStats();

  const summaryCards = [
    {
      title: "Assinantes Ativos",
      value: stats.activeCount.toString(),
      change: `MRR: R$ ${stats.mrr.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`,
      icon: Crown,
      color: "purple",
      progress: stats.retention
    },
    {
      title: "Receita Mensal",
      value: `R$ ${stats.mrr.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`,
      change: "+12% vs mês anterior", // Placeholder, could be calculated
      icon: DollarSign,
      color: "green",
      progress: Math.min((stats.mrr / 10000) * 100, 100) // Example progress based on a target
    },
    {
      title: "Taxa de Retenção",
      value: `${stats.retention}%`,
      change: "+5% vs mês anterior", // Placeholder
      icon: TrendingUp,
      color: "blue",
      progress: stats.retention
    },
    {
      title: "Total de Clientes",
      value: clients.length.toString(),
      change: "Novos este mês: 0", // Placeholder
      icon: Users,
      color: "orange",
      progress: 0 // Placeholder
    }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Carregando assinaturas...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assinaturas</h1>
            <p className="text-muted-foreground">
              Gerencie planos de assinatura e clientes assinantes
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setEditingPlan(null); setIsPlanDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
            <Button onClick={() => setIsSubscriptionDialogOpen(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Nova Assinatura
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                  <Progress value={stat.progress} className="mt-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">Nenhum plano de assinatura encontrado.</div>
              ) : (
                plans.map((plan) => (
                  <SubscriptionPlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={setEditingPlan}
                    onToggleStatus={togglePlanStatus}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">Nenhuma assinatura de cliente encontrada.</div>
              ) : (
                subscriptions.map((subscription) => (
                  <UserSubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onUpdateStatus={updateSubscriptionStatus}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <SubscriptionFormDialog
          isOpen={isPlanDialogOpen}
          setIsOpen={setIsPlanDialogOpen}
          editingPlan={editingPlan}
          savePlan={handleSavePlan}
        />

        <SubscriptionCreationDialog
          isOpen={isSubscriptionDialogOpen}
          setIsOpen={setIsSubscriptionDialogOpen}
          createSubscription={createSubscription}
          clients={clients}
          plans={plans}
        />
      </div>
    </Layout>
  );
};

export default Subscriptions;