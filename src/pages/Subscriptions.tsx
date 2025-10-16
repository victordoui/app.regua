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
    createPlan,
    createSubscription,
    updateSubscriptionStatus,
    getStats
  } = useSubscriptions();

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const stats = [
    {
      title: "Total de Assinantes",
      value: getStats().activeCount.toString(),
      change: `MRR: R$ ${getStats().mrr.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`,
      icon: Crown,
      color: "purple",
      progress: getStats().retention
    },
    {
      title: "Receita Mensal",
      value: `R$ ${getStats().mrr.toLocaleString('pt-br', { minimumFractionDigits: 2 })}`,
      change: "+12% vs mês anterior",
      icon: DollarSign,
      color: "green",
      progress: 85
    },
    {
      title: "Taxa de Retenção",
      value: `${getStats().retention}%`,
      change: "+5% vs mês anterior",
      icon: TrendingUp,
      color: "blue",
      progress: getStats().retention
    },
    {
      title: "Novos Clientes",
      value: "8",
      change: "+3 esta semana",
      icon: Users,
      color: "orange",
      progress: 70
    }
  ];

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
            <Button onClick={() => setIsPlanDialogOpen(true)}>
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
          {stats.map((stat, index) => {
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
              {plans.map((plan) => (
                <SubscriptionPlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={setEditingPlan}
                  onToggleStatus={() => {}}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <UserSubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onUpdateStatus={updateSubscriptionStatus}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <SubscriptionFormDialog
          isOpen={isPlanDialogOpen}
          setIsOpen={setIsPlanDialogOpen}
          editingPlan={editingPlan}
          savePlan={createPlan}
        />

        <SubscriptionCreationDialog
          isOpen={isSubscriptionDialogOpen}
          setIsOpen={setIsSubscriptionDialogOpen}
          createSubscription={createSubscription}
          clients={clients}
        />
      </div>
    </Layout>
  );
};

export default Subscriptions;