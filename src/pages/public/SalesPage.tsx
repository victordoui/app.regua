import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Check, X, Scissors, Calendar, BarChart3, Heart, ArrowRight, Star, Crown, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlanConfig } from '@/types/superAdmin';

const FEATURE_LABELS: Record<string, string> = {
  basic_scheduling: 'Agendamento Básico',
  client_management: 'Gestão de Clientes',
  reports: 'Relatórios',
  loyalty: 'Programa de Fidelidade',
  campaigns: 'Campanhas de Marketing',
  api_access: 'Acesso à API',
  priority_support: 'Suporte Prioritário',
  white_label: 'White Label',
  multi_location: 'Múltiplas Unidades',
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  trial: <Zap className="h-6 w-6" />,
  basic: <Star className="h-6 w-6" />,
  pro: <Crown className="h-6 w-6" />,
  enterprise: <Shield className="h-6 w-6" />,
};

const PLAN_GRADIENTS: Record<string, string> = {
  trial: 'from-slate-500 to-slate-600',
  basic: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-purple-600',
  enterprise: 'from-amber-500 to-orange-500',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const benefits = [
  { icon: Calendar, title: 'Agendamento Online', description: 'Seus clientes agendam direto pelo celular, 24h por dia. Sem ligações, sem confusão.' },
  { icon: BarChart3, title: 'Gestão Financeira', description: 'Controle de caixa, comissões, relatórios de vendas e faturamento em tempo real.' },
  { icon: Heart, title: 'Fidelização de Clientes', description: 'Programa de pontos, cupons de desconto e campanhas para manter seus clientes voltando.' },
  { icon: Scissors, title: 'Gestão Completa', description: 'Barbeiros, serviços, escalas e turnos organizados em um só lugar.' },
];

const faqs = [
  { q: 'Posso testar antes de assinar?', a: 'Sim! O plano Trial é gratuito por 14 dias, sem precisar de cartão de crédito.' },
  { q: 'Consigo trocar de plano depois?', a: 'Sim, você pode fazer upgrade ou downgrade a qualquer momento pelo painel.' },
  { q: 'Preciso instalar alguma coisa?', a: 'Não! O Na Régua funciona 100% no navegador, no celular ou computador.' },
  { q: 'Meus clientes precisam baixar app?', a: 'Não, eles agendam direto pelo link da sua barbearia, sem instalar nada.' },
  { q: 'Como funciona o suporte?', a: 'Todos os planos têm suporte por chat. Planos Pro e Enterprise têm suporte prioritário.' },
];

const SalesPage = () => {
  const navigate = useNavigate();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['public-plans'],
    queryFn: async (): Promise<PlanConfig[]> => {
      const { data, error } = await supabase
        .from('platform_plan_config')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as PlanConfig[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Na Régua</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>Entrar</Button>
            <Button onClick={() => navigate('/cadastro')}>Criar Conta</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
              ✂️ Plataforma #1 para Barbearias
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Gerencie sua barbearia<br />
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                como um profissional
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Agendamento online, gestão financeira, fidelização de clientes e muito mais. Tudo o que você precisa para fazer sua barbearia crescer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="text-base h-12 px-8" onClick={() => navigate('/cadastro')}>
                Começar Grátis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-8" onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver Planos
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Tudo que sua barbearia precisa
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center border-border/50">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <b.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Escolha o plano ideal</h2>
            <p className="text-muted-foreground">Comece grátis e faça upgrade quando quiser</p>
          </div>

          {isLoading ? (
            <LoadingSpinner className="py-20" size={32} />
          ) : (
            <div className={cn(
              'grid gap-6 mx-auto',
              plans.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              plans.length === 3 ? 'grid-cols-1 sm:grid-cols-3 max-w-4xl' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            )}>
              {plans.map((plan, i) => {
                const isPopular = plan.plan_type === 'pro';
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                          ⭐ Mais Popular
                        </Badge>
                      </div>
                    )}
                    <Card className={cn(
                      'h-full flex flex-col',
                      isPopular && 'border-primary shadow-lg ring-1 ring-primary/20'
                    )}>
                      <CardHeader className="text-center pb-2">
                        <div className={cn(
                          'w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white bg-gradient-to-r',
                          PLAN_GRADIENTS[plan.plan_type] || 'from-primary to-primary'
                        )}>
                          {PLAN_ICONS[plan.plan_type] || <Star className="h-6 w-6" />}
                        </div>
                        <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                        <div className="mt-2">
                          {plan.plan_type === 'trial' ? (
                            <div>
                              <span className="text-3xl font-bold text-foreground">Grátis</span>
                              <p className="text-sm text-muted-foreground">por 14 dias</p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-3xl font-bold text-foreground">{formatCurrency(plan.price_monthly)}</span>
                              <span className="text-muted-foreground">/mês</span>
                              {plan.price_yearly && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  ou {formatCurrency(plan.price_yearly)}/ano
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="space-y-2 text-sm mb-4">
                          <p className="text-muted-foreground">
                            Até <strong className="text-foreground">{plan.max_barbers}</strong> barbeiro{plan.max_barbers > 1 ? 's' : ''}
                          </p>
                          <p className="text-muted-foreground">
                            <strong className="text-foreground">{plan.max_appointments_month}</strong> agendamentos/mês
                          </p>
                        </div>

                        <div className="border-t border-border pt-4 space-y-2 flex-1">
                          {Object.entries(plan.features || {}).map(([feature, enabled]) => (
                            <div key={feature} className="flex items-center gap-2 text-sm">
                              {enabled ? (
                                <Check className="h-4 w-4 text-green-500 shrink-0" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                              )}
                              <span className={enabled ? 'text-foreground' : 'text-muted-foreground/60 line-through'}>
                                {FEATURE_LABELS[feature] || feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Button
                          className={cn('w-full mt-6', isPopular && 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white')}
                          variant={isPopular ? 'default' : 'outline'}
                          onClick={() => navigate(`/cadastro?plano=${plan.plan_type}`)}
                        >
                          {plan.plan_type === 'trial' ? 'Começar Grátis' : 'Começar Agora'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para transformar sua barbearia?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece gratuitamente e veja resultados em poucos dias.
          </p>
          <Button size="lg" className="text-base h-12 px-10" onClick={() => navigate('/cadastro')}>
            Criar Minha Conta Grátis <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Na Régua</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 Na Régua - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default SalesPage;
