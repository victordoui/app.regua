import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Crown,
  HeartHandshake,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import vizzuIcon from '@/assets/vizzu-icon.png';
import type { PlanConfig } from '@/types/superAdmin';
import { DEFAULT_PUBLIC_PLANS } from '@/lib/publicPlans';

const FEATURE_LABELS: Record<string, string> = {
  basic_scheduling: 'Agenda online inteligente',
  client_management: 'Gestão de clientes',
  reports: 'Relatórios e indicadores',
  loyalty: 'Programa de fidelidade',
  campaigns: 'Campanhas de marketing',
  api_access: 'Acesso à API',
  priority_support: 'Suporte prioritário',
  white_label: 'Marca própria',
  multi_location: 'Múltiplas unidades',
};

const COMPARISON_ROWS = [
  { key: 'price', label: 'Investimento mensal' },
  { key: 'yearly', label: 'Investimento anual' },
  { key: 'barbers', label: 'Profissionais incluídos' },
  { key: 'appointments', label: 'Agendamentos por mês' },
  { key: 'basic_scheduling', label: 'Agenda online inteligente' },
  { key: 'client_management', label: 'Gestão de clientes' },
  { key: 'reports', label: 'Relatórios e indicadores' },
  { key: 'loyalty', label: 'Programa de fidelidade' },
  { key: 'campaigns', label: 'Campanhas de marketing' },
  { key: 'priority_support', label: 'Suporte prioritário' },
] as const;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const segments = ['Barbearias', 'Salões', 'Estética', 'Manicure', 'Tatuagem', 'Clínicas', 'Pet shops', 'Bem-estar'];

const outcomes = [
  {
    icon: CalendarDays,
    title: 'Uma agenda que trabalha por você',
    description: 'Receba agendamentos 24 horas por dia, organize a equipe e reduza conflitos de horário.',
  },
  {
    icon: WalletCards,
    title: 'Controle financeiro sem planilhas',
    description: 'Acompanhe caixa, comissões, serviços e faturamento em uma visão simples e confiável.',
  },
  {
    icon: HeartHandshake,
    title: 'Clientes que voltam mais vezes',
    description: 'Use pontos, cupons, lembretes e campanhas para construir relacionamento de verdade.',
  },
];

const faqs = [
  { q: 'Posso testar antes de assinar?', a: 'Sim. Você pode começar pelo período de teste e conhecer o fluxo completo antes de escolher um plano.' },
  { q: 'Meus clientes precisam instalar um aplicativo?', a: 'Não. Eles acessam a página do seu negócio pelo navegador do celular e fazem tudo pelo link.' },
  { q: 'Consigo cadastrar mais de um profissional?', a: 'Sim. O limite depende do plano escolhido e você pode alterar o plano conforme sua operação crescer.' },
  { q: 'O VIZZU funciona fora de barbearias?', a: 'Sim. A plataforma atende diferentes negócios de serviços, como salões, estética, manicure, clínicas, tatuagem e bem-estar.' },
  { q: 'Consigo acompanhar resultados?', a: 'Sim. O painel reúne agenda, clientes, faturamento, desempenho da equipe e indicadores de fidelização.' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

const ProductPreview = () => (
  <div className="relative mx-auto w-full max-w-[650px] lg:rotate-[1.2deg]">
    <div className="absolute -inset-12 -z-10 rounded-full bg-blue-400/25 blur-3xl" />
    <div className="absolute -right-4 -top-6 z-20 hidden rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:block dark:border-white/10 dark:bg-slate-900/95">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Crescimento</p><p className="mt-0.5 flex items-center gap-1 text-sm font-black text-emerald-600"><TrendingUp className="h-4 w-4" /> +16,1% este mês</p>
    </div>
    <div className="absolute -bottom-5 -left-5 z-20 hidden items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex dark:border-white/10 dark:bg-slate-900/95">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-primary"><CalendarDays className="h-5 w-5" /></span><div><p className="text-xs font-black">Agenda online 24h</p><p className="text-[10px] text-slate-500">Seu negócio nunca fecha</p></div>
    </div>
    <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_35px_100px_-30px_rgba(15,47,107,0.55)] dark:border-white/10 dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 p-1 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-400/20"><img src={vizzuIcon} alt="" className="h-full w-full object-contain" /></span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Visão do negócio</p>
            <p className="text-xs text-slate-500">Hoje, 28 de julho</p>
          </div>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Operação ativa</div>
      </div>

      <div className="space-y-4 bg-slate-50/70 p-5 dark:bg-slate-900/60">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Agenda hoje', value: '18', icon: CalendarDays, color: 'text-blue-600 bg-blue-50' },
            { label: 'Ocupação', value: '84%', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Novos clientes', value: '12', icon: Users, color: 'text-violet-600 bg-violet-50' },
            { label: 'Receita', value: 'R$ 1.840', icon: WalletCards, color: 'text-orange-600 bg-orange-50' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className={cn('mb-3 flex h-8 w-8 items-center justify-center rounded-lg', item.color)}>
                <item.icon className="h-4 w-4" />
              </div>
              <p className="text-lg font-extrabold text-slate-950 dark:text-white">{item.value}</p>
              <p className="text-[11px] text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Próximos horários</p>
                <p className="text-xs text-slate-500">Equipe e atendimentos do dia</p>
              </div>
              <Clock3 className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2">
              {[
                ['09:30', 'Corte + barba', 'Carlos'],
                ['10:20', 'Corte feminino', 'Ana'],
                ['11:10', 'Manicure', 'Bianca'],
              ].map(([time, service, professional], index) => (
                <div key={time} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900">
                  <div className={cn('h-9 w-1 rounded-full', index === 0 ? 'bg-primary' : index === 1 ? 'bg-violet-500' : 'bg-orange-500')} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{service}</p>
                    <p className="text-[11px] text-slate-500">com {professional}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#0A2861] via-[#164A9E] to-[#2E6FD3] p-4 text-white">
            <p className="text-xs font-semibold text-blue-100">Faturamento mensal</p>
            <p className="mt-1 text-2xl font-extrabold text-white">R$ 24.860</p>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" /> 16,1% este mês
            </div>
            <div className="mt-7 flex h-20 items-end gap-1.5">
              {[34, 48, 42, 63, 58, 76, 69, 92, 84, 100].map((height, index) => (
                <div key={index} className="flex-1 rounded-t bg-white/80" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PlanIcon = ({ type }: { type: string }): ReactNode => {
  if (type === 'pro') return <Crown className="h-5 w-5" />;
  if (type === 'enterprise') return <ShieldCheck className="h-5 w-5" />;
  if (type === 'trial') return <Sparkles className="h-5 w-5" />;
  return <Star className="h-5 w-5" />;
};

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
      return !error && data?.length ? data as PlanConfig[] : DEFAULT_PUBLIC_PLANS;
    },
  });

  return (
    <div className="min-h-screen scroll-smooth overflow-x-hidden bg-[#f7f9fc] text-slate-950 dark:bg-slate-950 dark:text-white">
      <main>
        <section className="relative isolate overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:pb-24">
          <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_48%,#f9fbff_100%)] dark:bg-[linear-gradient(135deg,#020617_0%,#071b3e_50%,#020617_100%)]" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-96 w-96 rounded-full bg-blue-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-violet-300/20 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-7 flex items-center gap-4">
                <img
                  src={vizzuIcon}
                  alt="Logo VIZZU"
                  className="h-28 w-28 shrink-0 object-contain drop-shadow-[0_20px_25px_rgba(37,99,235,0.24)] sm:h-36 sm:w-36"
                />
                <div><p className="text-[40px] font-black leading-none tracking-[0.08em] text-[#0F2F6B] sm:text-5xl dark:text-white">VIZZU</p><p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-primary sm:text-sm">Visualize · Organize · Cresça</p></div>
              </div>
              <Badge className="mb-5 rounded-full border-primary/20 bg-white/80 px-3 py-1.5 text-primary shadow-sm hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/10">
                <Zap className="mr-1.5 h-3.5 w-3.5 fill-current" /> Gestão simples para negócios de serviços
              </Badge>
              <h1 className="max-w-2xl text-4xl font-black leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-[58px]">
                Seu negócio organizado. <span className="bg-gradient-to-r from-[#2878ef] via-[#1557b8] to-[#0F2F6B] bg-clip-text text-transparent dark:from-blue-300 dark:to-blue-100">Seu crescimento acontecendo.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
                Uma plataforma bonita, simples e completa para cuidar da agenda, clientes, equipe e financeiro — enquanto seus clientes agendam pelo celular.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-13 rounded-xl px-7 text-base shadow-lg shadow-primary/25" onClick={() => navigate('/cadastro')}>
                  Começar agora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-13 rounded-xl border-slate-300 bg-white/70 px-7 text-base dark:border-slate-700 dark:bg-slate-900/60" asChild><a href="#planos">Conhecer os planos</a></Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                {['Teste sem compromisso', 'Configuração rápida', 'Suporte humano'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />{item}</span>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}>
              <ProductPreview />
            </motion.div>
          </div>
          <motion.div {...fadeUp} className="mx-auto mt-16 grid max-w-7xl overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-[0_18px_50px_-30px_rgba(15,47,107,0.45)] backdrop-blur sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-slate-900/70">
            {[['24h', 'Agendamento online'], ['100%', 'Pensado para celular'], ['1 painel', 'Toda a operação'], ['+ tempo', 'Para atender e crescer']].map(([value, label], index) => <div key={label} className={cn('px-6 py-5 text-center', index > 0 && 'border-t border-slate-200/70 sm:border-l sm:border-t-0', index === 2 && 'sm:border-t lg:border-t-0', 'dark:border-slate-700')}><p className="text-2xl font-black text-primary">{value}</p><p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p></div>)}
          </motion.div>
        </section>

        <section className="border-y border-slate-200/80 bg-white px-4 py-8 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl">
            <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Feito para quem vive de atender bem</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {segments.map((segment) => <span key={segment} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{segment}</span>)}
            </div>
          </div>
        </section>

        <section id="recursos" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Tudo no lugar certo</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Uma operação organizada do agendamento ao resultado</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">O VIZZU reúne as tarefas que costumam ficar espalhadas e transforma tudo em uma rotina simples.</p>
            </motion.div>
            <div className="grid gap-5 lg:grid-cols-3">
              {outcomes.map((outcome, index) => (
                <motion.div key={outcome.title} {...fadeUp} transition={{ delay: index * 0.08 }}>
                  <Card className="group h-full overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <CardContent className="p-7">
                      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white"><outcome.icon className="h-6 w-6" /></div>
                      <h3 className="text-xl font-bold">{outcome.title}</h3>
                      <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{outcome.description}</p>
                      <div className="mt-6 flex items-center gap-1 text-sm font-bold text-primary">Conheça os recursos <ChevronRight className="h-4 w-4" /></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:pb-28">
          <motion.div {...fadeUp} className="mx-auto grid max-w-7xl overflow-hidden rounded-[32px] bg-[#0B1F45] text-white shadow-2xl lg:grid-cols-[1fr_0.9fr]">
            <div className="p-8 sm:p-12 lg:p-16">
              <Badge className="border-white/15 bg-white/10 text-blue-100 hover:bg-white/10">Experiência do cliente</Badge>
              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">Seu cliente agenda em poucos passos. Você recebe tudo organizado.</h2>
              <p className="mt-5 max-w-xl leading-7 text-blue-100/80">Uma página própria, adaptada para celular, com serviços, profissionais, horários e agendamento para uma ou mais pessoas.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {['Link personalizado do negócio', 'Valores separados por pessoa', 'Lembretes e histórico', 'Cancelamento e remarcação'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm font-semibold text-blue-50"><div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15"><Check className="h-3.5 w-3.5 text-emerald-300" /></div>{item}</div>
                ))}
              </div>
            </div>
            <div className="relative flex min-h-[340px] items-center justify-center bg-gradient-to-br from-blue-500/20 to-orange-400/10 p-8">
              <div className="w-[260px] rounded-[32px] border-[7px] border-slate-900 bg-slate-50 p-3 shadow-2xl">
                <div className="rounded-[22px] bg-white p-4">
                  <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 p-1"><img src={vizzuIcon} alt="" className="h-full w-full object-contain" /></span><div><p className="text-xs font-bold text-slate-900">Seu negócio</p><p className="text-[10px] text-slate-500">Agendamento online</p></div></div>
                  <div className="mt-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-widest text-orange-100">Agenda online</p><p className="mt-1 text-sm font-bold">Seu próximo horário, sem complicação</p></div>
                  <div className="mt-4 space-y-2">{['Escolha o serviço', 'Selecione o profissional', 'Confirme o horário'].map((step, index) => <div key={step} className="flex items-center gap-2 rounded-xl bg-slate-100 p-2.5 text-[11px] font-semibold text-slate-700"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] text-white">{index + 1}</span>{step}</div>)}</div>
                  <div className="mt-4 rounded-xl bg-primary py-2.5 text-center text-[11px] font-bold text-white">Agendar agora</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="planos" className="scroll-mt-24 border-y border-slate-200 bg-white px-4 py-20 sm:px-6 lg:py-28 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Planos flexíveis</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Comece no seu ritmo. Cresça sem trocar de sistema.</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Escolha o plano que acompanha o momento atual do seu negócio.</p>
            </motion.div>
            {isLoading ? <LoadingSpinner className="py-20" size={32} /> : (
              <><div className={cn('mx-auto grid items-stretch gap-5', plans.length <= 2 ? 'max-w-3xl md:grid-cols-2' : plans.length === 3 ? 'max-w-5xl md:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4')}>
                {plans.map((plan, index) => {
                  const popular = plan.plan_type === 'pro';
                  return (
                    <motion.div key={plan.id} {...fadeUp} transition={{ delay: index * 0.07 }} className="relative pt-3">
                      {popular && <div className="absolute inset-x-0 top-0 z-10 mx-auto w-fit rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg">Mais escolhido</div>}
                      <Card className={cn('flex h-full flex-col rounded-3xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950', popular && 'border-primary shadow-xl shadow-primary/10 ring-1 ring-primary')}>
                        <CardHeader className="p-6 pb-3">
                          <div className={cn('mb-4 flex h-10 w-10 items-center justify-center rounded-xl', popular ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200')}><PlanIcon type={plan.plan_type} /></div>
                          <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                          <div className="pt-2">{plan.plan_type === 'trial' ? <><span className="text-3xl font-black">Grátis</span><p className="mt-1 text-sm text-slate-500">por {plan.trial_days || 7} dias para conhecer o VIZZU</p></> : <><span className="text-3xl font-black">{formatCurrency(plan.price_monthly)}</span><span className="text-sm text-slate-500">/mês</span>{plan.price_yearly ? <p className="mt-1 text-xs text-slate-500">{formatCurrency(plan.price_yearly)} no plano anual</p> : null}</>}</div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col p-6 pt-3">
                          <div className="mb-5 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300"><strong className="text-slate-950 dark:text-white">{plan.max_barbers}</strong> profissionais · <strong className="text-slate-950 dark:text-white">{plan.max_appointments_month}</strong> agendamentos/mês</div>
                          <div className="flex-1 space-y-2.5">{Object.entries(plan.features || {}).map(([feature, enabled]) => <div key={feature} className="flex items-start gap-2 text-sm">{enabled ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}<span className={enabled ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 line-through'}>{FEATURE_LABELS[feature] || feature}</span></div>)}</div>
                          <Button className="mt-7 w-full rounded-xl" variant={popular ? 'default' : 'outline'} onClick={() => navigate(`/cadastro?plano=${plan.plan_type}`)}>{plan.plan_type === 'trial' ? 'Testar gratuitamente' : 'Escolher este plano'}<ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-16 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
                  <div><Badge className="mb-3 border-primary/15 bg-primary/10 text-primary hover:bg-primary/10">Comparativo completo</Badge><h3 className="text-2xl font-black tracking-tight">Compare antes de escolher</h3><p className="mt-1 text-sm text-slate-500">Veja preços, limites e recursos de cada plano lado a lado.</p></div>
                  <p className="text-xs font-medium text-slate-400">Deslize para o lado no celular</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse text-left">
                    <thead><tr className="bg-slate-50/80 dark:bg-slate-900/70"><th className="sticky left-0 z-10 min-w-[220px] bg-slate-50 px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900">O que está incluído</th>{plans.map((plan) => <th key={plan.id} className={cn('min-w-[150px] px-4 py-5 text-center', plan.plan_type === 'pro' && 'bg-primary/5')}><div className="font-black text-slate-950 dark:text-white">{plan.display_name}</div>{plan.plan_type === 'pro' && <span className="mt-1 inline-flex rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">Recomendado</span>}</th>)}</tr></thead>
                    <tbody>{COMPARISON_ROWS.map((row, rowIndex) => <tr key={row.key} className={cn('border-t border-slate-100 dark:border-slate-800', rowIndex % 2 === 1 && 'bg-slate-50/40 dark:bg-slate-900/30')}><th className="sticky left-0 z-10 bg-inherit px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{row.label}</th>{plans.map((plan) => { let value: ReactNode; if (row.key === 'price') value = plan.plan_type === 'trial' ? 'Grátis' : `${formatCurrency(plan.price_monthly)}/mês`; else if (row.key === 'yearly') value = plan.plan_type === 'trial' ? '—' : plan.price_yearly ? formatCurrency(plan.price_yearly) : '—'; else if (row.key === 'barbers') value = plan.max_barbers; else if (row.key === 'appointments') value = plan.max_appointments_month.toLocaleString('pt-BR'); else value = plan.features?.[row.key] ? <Check className="mx-auto h-5 w-5 text-emerald-500" /> : <span className="text-slate-300">—</span>; return <td key={`${plan.id}-${row.key}`} className={cn('px-4 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200', plan.plan_type === 'pro' && 'bg-primary/[0.025]')}>{value}</td>; })}</tr>)}</tbody>
                  </table>
                </div>
              </div></>
            )}
          </div>
        </section>

        <section id="duvidas" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <motion.div {...fadeUp}>
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Sem letras pequenas</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Dúvidas antes de começar?</h2>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">As respostas mais importantes para você entender como o VIZZU entra na rotina do seu negócio.</p>
              <div className="mt-7 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"><MessageCircleMore className="h-5 w-5" /></div><div><p className="text-sm font-bold">Ainda precisa de ajuda?</p><p className="text-xs text-slate-500">Nossa equipe pode orientar você.</p></div></div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
              <Accordion type="single" collapsible className="rounded-3xl border border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
                {faqs.map((faq, index) => <AccordionItem key={faq.q} value={`faq-${index}`}><AccordionTrigger className="py-5 text-left text-base font-bold hover:no-underline">{faq.q}</AccordionTrigger><AccordionContent className="pb-5 leading-7 text-slate-600 dark:text-slate-300">{faq.a}</AccordionContent></AccordionItem>)}
              </Accordion>
            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6">
          <motion.div {...fadeUp} className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-r from-[#2E6FD3] to-[#0F2F6B] px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-16">
            <Sparkles className="mx-auto h-8 w-8 text-blue-200" />
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Seu negócio pode ser mais organizado já no próximo atendimento.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100">Crie sua conta, configure seus serviços e compartilhe sua página de agendamento.</p>
            <Button size="lg" className="mt-8 rounded-xl !bg-white px-8 !text-[#0F2F6B] shadow-lg shadow-slate-950/15 hover:!bg-blue-50" onClick={() => navigate('/cadastro')}>Começar com o VIZZU <ArrowRight className="ml-2 h-5 w-5" /></Button>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 p-1"><img src={vizzuIcon} alt="VIZZU" className="h-full w-full object-contain" /></span><span className="font-black">VIZZU</span></div>
          <p className="text-center text-sm text-slate-500">Gestão inteligente para negócios de serviços.</p>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} VIZZU</p>
        </div>
      </footer>
    </div>
  );
};

export default SalesPage;
