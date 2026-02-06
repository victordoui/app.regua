import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useMySubscription } from '@/hooks/useMySubscription';
import { Crown, Check, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Upgrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription } = useMySubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['upgrade-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_plan_config')
        .select('*')
        .eq('is_active', true)
        .neq('plan_type', 'trial')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const handleCheckout = async (planType: string) => {
    setLoadingPlan(planType);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_type: planType },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao iniciar pagamento',
        description: err.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              Escolha seu Plano
            </h1>
            <p className="text-muted-foreground text-sm">
              Faça upgrade do seu trial e desbloqueie todos os recursos.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const features = (plan.features as string[]) || [];
              const isCurrent = subscription?.plan_type === plan.plan_type;

              return (
                <Card key={plan.id} className={`flex flex-col ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                      {isCurrent && <Badge className="bg-primary/10 text-primary text-xs">Atual</Badge>}
                    </div>
                    <p className="text-2xl font-bold mt-2">
                      R$ {Number(plan.price_monthly).toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Até {plan.max_barbers} barbeiros • {plan.max_appointments_month} agend./mês
                    </p>
                    {features.length > 0 && (
                      <ul className="space-y-1.5 pt-2">
                        {features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={isCurrent || loadingPlan !== null}
                      onClick={() => handleCheckout(plan.plan_type)}
                    >
                      {loadingPlan === plan.plan_type ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isCurrent ? 'Plano Atual' : 'Assinar'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Upgrade;
