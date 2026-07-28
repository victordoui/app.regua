import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CreditCard, Users, TrendingUp, DollarSign, Plus, Crown } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { PlanFormData, SubscriptionPlan } from '@/types/subscriptions';
import Layout from '@/components/Layout';
import SubscriptionPlanCard from '@/components/subscriptions/SubscriptionPlanCard';
import UserSubscriptionCard from '@/components/subscriptions/UserSubscriptionCard';
import SubscriptionFormDialog from '@/components/subscriptions/SubscriptionFormDialog';
import SubscriptionCreationDialog from '@/components/subscriptions/SubscriptionCreationDialog';
import { PageContainer, PageHeader } from '@/components/ui/page-header';
import { SectionTabsLayout } from '@/components/ui/section-tabs';
import { StatusCards } from '@/components/ui/status-cards';

const subscriptionSections = [
  { value: 'plans', label: 'Planos', description: 'Opções oferecidas', icon: Crown },
  { value: 'subscriptions', label: 'Clientes assinantes', description: 'Assinaturas em andamento', icon: CreditCard },
] as const;

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

  const handleSavePlan = async (formData: PlanFormData, id: string | null) => {
    if (id) {
      await updatePlan({ id, formData });
    } else {
      await createPlan(formData);
    }
  };

  const stats = getStats();

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
      <PageContainer>
        <PageHeader eyebrow="Engajamento" icon={<Crown className="h-5 w-5" />} title="Planos e Assinaturas" subtitle="Crie planos recorrentes e acompanhe os clientes assinantes.">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setEditingPlan(null); setIsPlanDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
            <Button onClick={() => setIsSubscriptionDialogOpen(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Nova Assinatura
            </Button>
          </div>
        </PageHeader>

        <StatusCards
          items={[
            { label: 'Assinantes ativos', value: stats.activeCount, icon: <Crown className="h-5 w-5" />, color: 'purple' },
            { label: 'Receita mensal', value: `R$ ${stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign className="h-5 w-5" />, color: 'green' },
            { label: 'Taxa de retenção', value: `${stats.retention}%`, icon: <TrendingUp className="h-5 w-5" />, color: 'blue' },
            { label: 'Clientes disponíveis', value: clients.length, icon: <Users className="h-5 w-5" />, color: 'amber' },
          ]}
        />

        <Tabs defaultValue="plans">
          <SectionTabsLayout items={subscriptionSections} navigationTitle="O que você quer gerenciar?">
          <TabsContent value="plans" className="mt-0 space-y-4">
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

          <TabsContent value="subscriptions" className="mt-0 space-y-4">
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
          </SectionTabsLayout>
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
      </PageContainer>
    </Layout>
  );
};

export default Subscriptions;
