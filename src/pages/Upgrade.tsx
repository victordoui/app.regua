import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useMySubscription } from '@/hooks/useMySubscription';
import { Crown, Check, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_PUBLIC_PLANS } from '@/lib/publicPlans';
import type { PlanConfig } from '@/types/superAdmin';

const Upgrade = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { subscription } = useMySubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const accessReason = searchParams.get('motivo');
  const accessMessages: Record<string, string> = {
    missing: 'Não encontramos uma assinatura vinculada à sua empresa.',
    suspended: 'A assinatura da sua empresa está suspensa.',
    cancelled: 'A assinatura da sua empresa foi cancelada.',
    expired: 'O período de teste ou a assinatura da sua empresa terminou.',
    pending_payment: 'Existe um pagamento pendente na assinatura da sua empresa.',
  };

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['upgrade-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_plan_config')
        .select('*')
        .eq('is_active', true)
        .neq('plan_type', 'trial')
        .order('sort_order', { ascending: true });
      if (error) return DEFAULT_PUBLIC_PLANS.filter((plan) => plan.plan_type !== 'trial');
      return data?.length ? data as PlanConfig[] : DEFAULT_PUBLIC_PLANS.filter((plan) => plan.plan_type !== 'trial');
    },
  });

  const handleCheckout = async (planType: string) => {
    setLoadingPlan(planType);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_type: planType, billing_cycle: billingCycle },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (err: unknown) {
      toast({
        title: 'Erro ao iniciar pagamento',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <PageHeader eyebrow="Minha assinatura" icon={<Crown className="h-5 w-5" />} title="Escolha seu plano" subtitle="Compare os recursos e escolha o plano ideal para seu negócio.">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </PageHeader>

        {accessReason && accessMessages[accessReason] && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Seu acesso precisa ser regularizado</p>
              <p className="mt-1 text-muted-foreground">{accessMessages[accessReason]} Escolha um plano para continuar usando o VIZZU.</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border bg-card p-2 sm:ml-auto sm:w-fit">
          <Button size="sm" variant={billingCycle === 'monthly' ? 'default' : 'ghost'} onClick={() => setBillingCycle('monthly')}>Mensal</Button>
          <Button size="sm" variant={billingCycle === 'yearly' ? 'default' : 'ghost'} onClick={() => setBillingCycle('yearly')}>Anual · 2 meses grátis</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const featureFlags = (plan.features as Record<string, boolean>) || {};
              const comingSoon = new Set(['client_subscription_club', 'white_label', 'multi_location']);
              const featureLabels: Record<string, string> = {
                basic_scheduling: 'Agenda e agendamento online', client_management: 'Gestão de clientes', services: 'Cadastro de serviços', public_booking: 'Link público de agendamento',
                reminders_150: '150 lembretes por mês', reminders_600: '600 lembretes por mês', reminders_2000: '2.000 lembretes por mês', basic_reports: 'Relatórios básicos', complete_reports: 'Relatórios completos',
                commissions: 'Comissões', pix_deposit: 'Sinal por Pix', loyalty: 'Programa de fidelidade', campaigns: 'Campanhas', stock: 'Controle de estoque', client_subscription_club: 'Clube de assinatura para clientes', white_label: 'Marca própria', multi_location: 'Até 2 unidades', priority_support: 'Suporte prioritário',
              };
              const activeFeatures = Object.entries(featureFlags).filter(([key, enabled]) => enabled || comingSoon.has(key));
              const isCurrent = subscription?.plan_type === plan.plan_type;
              const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

              return (
                <Card key={plan.id} className={`flex flex-col ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                      {isCurrent && <Badge className="bg-primary/10 text-primary text-xs">Atual</Badge>}
                      {plan.plan_type === 'pro' && <Badge variant="secondary" className="text-xs">Mais escolhido</Badge>}
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      {price == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(price))}
                      <span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'yearly' ? 'ano' : 'mês'}</span>
                    </p>
                    {billingCycle === 'yearly' && <p className="text-xs text-muted-foreground">Equivale a {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plan.price_monthly))}/mês no pagamento anual.</p>}
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    <p className="text-xs text-muted-foreground">Até {plan.max_barbers} profissionais • agendamentos ilimitados</p>
                    {activeFeatures.length > 0 && (
                      <ul className="space-y-1.5 pt-2">
                        {activeFeatures.map(([key], i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{featureLabels[key] || key}{comingSoon.has(key) ? <span className="ml-1 text-xs text-amber-600">Em breve</span> : ''}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={isCurrent || loadingPlan !== null || price == null || (billingCycle === 'monthly' ? !plan.stripe_price_id : !plan.stripe_price_yearly_id)}
                      onClick={() => handleCheckout(plan.plan_type)}
                    >
                      {loadingPlan === plan.plan_type ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isCurrent ? 'Plano Atual' : price == null ? 'Preço anual não configurado' : (billingCycle === 'monthly' ? !plan.stripe_price_id : !plan.stripe_price_yearly_id) ? 'Pagamento em configuração' : 'Assinar'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        <p className="mt-5 text-center text-xs text-muted-foreground">Profissional adicional: R$ 12,00 por mês. Recursos marcados como “Em breve” ainda estão em desenvolvimento.</p>
      </div>
    </Layout>
  );
};

export default Upgrade;
