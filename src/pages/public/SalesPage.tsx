import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  ArrowRightIcon as ArrowRight,
  ChartLineUpIcon as BarChart3,
  CalendarCheckIcon as CalendarDays,
  CheckIcon as Check,
  CaretRightIcon as ChevronRight,
  ClockIcon as Clock3,
  CrownIcon as Crown,
  FlowerLotusIcon,
  HairDryerIcon,
  HandPalmIcon,
  HandshakeIcon as HeartHandshake,
  ChatCircleDotsIcon as MessageCircleMore,
  MoonStarsIcon,
  PawPrintIcon,
  PenNibIcon,
  ScissorsIcon,
  ShieldCheckIcon as ShieldCheck,
  SparkleIcon as Sparkles,
  StarIcon as Star,
  StethoscopeIcon,
  StorefrontIcon,
  SunIcon,
  TrendUpIcon as TrendingUp,
  UsersThreeIcon as Users,
  WalletIcon as WalletCards,
  XIcon as X,
  LightningIcon as Zap,
} from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import vizzuIcon from '@/assets/vizzu-icon.png';
import heroDashboard from '@/assets/sales/vizzu-sales-dashboard-barbershop.png';
import heroWoman from '@/assets/sales/vizzu-sales-woman-left.png';
import heroMan from '@/assets/sales/vizzu-sales-man-right.png';
import mobileDashboard from '@/assets/sales/vizzu-mobile-dashboard.png';
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

const segments = [
  { name: 'Barbearias', detail: 'Cortes, equipe e recorrência', icon: ScissorsIcon, iconTone: 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300', glow: 'bg-blue-400/20' },
  { name: 'Salões', detail: 'Agenda, pacotes e relacionamento', icon: HairDryerIcon, iconTone: 'bg-violet-500/10 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300', glow: 'bg-violet-400/20' },
  { name: 'Estética', detail: 'Procedimentos e fidelização', icon: Sparkles, iconTone: 'bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-400/15 dark:text-fuchsia-300', glow: 'bg-fuchsia-400/20' },
  { name: 'Manicure', detail: 'Horários, serviços e comissões', icon: HandPalmIcon, iconTone: 'bg-rose-500/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300', glow: 'bg-rose-400/20' },
  { name: 'Tatuagem', detail: 'Sessões, artistas e clientes', icon: PenNibIcon, iconTone: 'bg-orange-500/10 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300', glow: 'bg-orange-400/20' },
  { name: 'Clínicas', detail: 'Atendimentos e organização', icon: StethoscopeIcon, iconTone: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300', glow: 'bg-emerald-400/20' },
  { name: 'Pet shops', detail: 'Serviços, agenda e histórico', icon: PawPrintIcon, iconTone: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-300', glow: 'bg-cyan-400/20' },
  { name: 'Bem-estar', detail: 'Rotina, agenda e clientes', icon: FlowerLotusIcon, iconTone: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300', glow: 'bg-indigo-400/20' },
];

const Reveal = ({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const ThemeSwitch = ({ isDark, onToggle, compact = false }: { isDark: boolean; onToggle: () => void; compact?: boolean }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      'group flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/80 p-2 text-[#0F2F6B] shadow-[0_14px_40px_-22px_rgba(15,47,107,0.8)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/10 dark:bg-slate-950/75 dark:text-blue-100 dark:hover:bg-slate-900',
      !compact && 'pr-3.5',
    )}
    aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
  >
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-md shadow-blue-500/20">
      {isDark ? <SunIcon className="h-4 w-4" weight="duotone" /> : <MoonStarsIcon className="h-4 w-4" weight="duotone" />}
    </span>
    {!compact && <span className="text-xs font-bold">{isDark ? 'Modo claro' : 'Modo escuro'}</span>}
  </button>
);

const proofHighlights = [
  { icon: CalendarDays, value: 'Agenda 24h', label: 'Seus clientes agendam sozinhos', detail: 'Disponível todos os dias para gerar mais conveniência e menos ligações.', color: 'bg-blue-50 text-blue-600' },
  { icon: Check, value: '7 dias grátis', label: 'Conheça antes de assinar', detail: 'Teste os recursos do VIZZU sem compromisso e veja a diferença na rotina.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: ShieldCheck, value: 'Dados protegidos', label: 'Segurança em primeiro lugar', detail: 'Informações do negócio e dos clientes protegidas com acesso controlado.', color: 'bg-violet-50 text-violet-600' },
  { icon: HeartHandshake, value: 'Suporte humano', label: 'Ajuda de verdade quando precisar', detail: 'Atendimento rápido e atencioso com pessoas reais durante sua jornada.', color: 'bg-orange-50 text-orange-600' },
];

const trustedBusinesses = ['Marshalls Barber', 'Studio Beauty', 'Clínica Bem Estar', 'PetCare', 'Fitness Club'];

const heroMessages = [
  { first: 'Sua agenda cheia.', second: 'Seu negócio no controle.' },
  { first: 'Mais clientes voltando.', second: 'Mais crescimento acontecendo.' },
  { first: 'Sua equipe organizada.', second: 'Seus resultados visíveis.' },
];

const showLegacySalesSections = false;

const productCapabilities = [
  { icon: CalendarDays, title: 'Agendamentos online', description: 'Seus clientes escolhem serviço, profissional e horário sem precisar ligar.', color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300' },
  { icon: Users, title: 'Gestão de clientes', description: 'Histórico, preferências e relacionamento reunidos em um único lugar.', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  { icon: WalletCards, title: 'Financeiro simplificado', description: 'Recebimentos, despesas e resultados organizados para decisões seguras.', color: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
  { icon: BarChart3, title: 'Relatórios inteligentes', description: 'Indicadores claros mostram o que funciona e onde seu negócio pode crescer.', color: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300' },
];

const faqs = [
  { q: 'Posso testar antes de assinar?', a: 'Sim. Você pode usar o VIZZU gratuitamente por 7 dias, sem cartão de crédito, e escolher um plano depois de conhecer o fluxo completo.' },
  { q: 'Meus clientes precisam instalar um aplicativo?', a: 'Não. Eles acessam a página do seu negócio pelo navegador do celular e fazem tudo pelo link.' },
  { q: 'Consigo cadastrar mais de um profissional?', a: 'Sim. O limite depende do plano escolhido e você pode alterar o plano conforme sua operação crescer.' },
  { q: 'O VIZZU funciona fora de barbearias?', a: 'Sim. A plataforma atende diferentes negócios de serviços, como salões, estética, manicure, clínicas, tatuagem e bem-estar.' },
  { q: 'Consigo acompanhar resultados?', a: 'Sim. O painel reúne agenda, clientes, faturamento, desempenho da equipe e indicadores de fidelização.' },
];

const ProductPreview = () => {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 0.35], [0, reduceMotion ? 0 : 38]);

  return (
  <motion.div style={{ y: parallaxY }} className="relative mx-auto min-h-[630px] w-full max-w-[720px] sm:min-h-[540px]">
    <motion.div
      className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-br from-blue-400/35 via-violet-300/25 to-transparent blur-3xl dark:from-blue-500/20 dark:via-violet-500/15"
      animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.72, 1, 0.72] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -right-5 bottom-12 -z-10 h-36 w-36 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 opacity-90 shadow-[0_25px_70px_rgba(71,77,229,0.3)] sm:h-44 sm:w-44"
      animate={reduceMotion ? undefined : { y: [0, -14, 0], rotate: [0, 8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute left-5 top-5 h-9 w-9 rotate-45 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/20 sm:left-12"
      animate={reduceMotion ? undefined : { rotate: [45, 90, 45], y: [0, 8, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute right-16 top-3"
      animate={reduceMotion ? undefined : { rotate: [0, 18, 0], scale: [1, 1.12, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    ><Sparkles className="h-8 w-8 text-amber-400 drop-shadow-sm" weight="duotone" /></motion.div>

    <motion.div
      className="absolute inset-x-0 top-12 z-10 overflow-hidden rounded-[26px] border border-white/90 bg-white shadow-[0_38px_100px_-34px_rgba(15,47,107,0.55)] dark:border-white/10 dark:bg-[#08152f] dark:shadow-[0_42px_110px_-34px_rgba(37,99,235,0.38)] sm:left-10 sm:right-3"
      initial={reduceMotion ? false : { opacity: 0, y: 30, rotateX: 8, rotateY: -6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1400 }}
    >
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4 dark:border-white/10 sm:px-5">
        <div className="flex items-center gap-2.5"><img src={vizzuIcon} alt="" className="h-8 w-8 object-contain" /><span className="text-sm font-black tracking-[0.04em] text-[#0F2F6B] dark:text-white">VIZZU</span></div>
        <div className="hidden w-44 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[9px] text-slate-400 sm:flex"><span className="h-3 w-3 rounded-full border border-slate-300" /> Buscar no sistema...</div>
        <div className="flex items-center gap-2"><span className="h-7 w-7 rounded-full bg-slate-100" /><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">A</span></div>
      </div>

      <div className="bg-[#f7f9fd] p-4 dark:bg-[#071126] sm:p-5">
        <div className="mb-4 flex items-end justify-between"><div><p className="text-sm font-black text-slate-900 dark:text-white sm:text-base">Visão geral</p><p className="text-[9px] text-slate-400">Hoje, sua operação em um só lugar</p></div><span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">Este mês</span></div>

        <div className="grid grid-cols-3 gap-2.5">
          {[{ label: 'Agendamentos', value: '214', change: '+14%', color: 'text-blue-600 bg-blue-50' }, { label: 'Conclusão', value: '92%', change: '+5%', color: 'text-emerald-600 bg-emerald-50' }, { label: 'Novos clientes', value: '38', change: '+31%', color: 'text-violet-600 bg-violet-50' }].map((item, index) => <motion.div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.055]" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.08 }}><div className={cn('mb-3 flex h-7 w-7 items-center justify-center rounded-lg', item.color)}><TrendingUp className="h-3.5 w-3.5" weight="duotone" /></div><div className="flex items-end justify-between gap-1"><p className="text-base font-black text-slate-900 dark:text-white sm:text-lg">{item.value}</p><span className="text-[8px] font-bold text-emerald-500">{item.change}</span></div><p className="mt-0.5 text-[8px] text-slate-400 sm:text-[9px]">{item.label}</p></motion.div>)}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.055]">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-[11px] font-bold text-slate-800">Metas do negócio</p><p className="text-[8px] text-slate-400">Acompanhe a evolução da equipe</p></div><BarChart3 className="h-4 w-4 text-primary" /></div>
            <div className="space-y-3">{[['Ocupação da agenda', '84%', 'w-[84%]', 'bg-blue-500'], ['Clientes recorrentes', '71%', 'w-[71%]', 'bg-violet-500'], ['Meta de faturamento', '92%', 'w-[92%]', 'bg-emerald-500']].map(([label, value, width, color]) => <div key={label}><div className="mb-1 flex justify-between text-[9px]"><span className="font-semibold text-slate-600">{label}</span><span className="font-bold text-slate-800">{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={cn('h-full rounded-full', width, color)} /></div></div>)}</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.055]">
            <div className="mb-3 flex items-center justify-between"><div><p className="text-[11px] font-bold text-slate-800">Equipe em movimento</p><p className="text-[8px] text-slate-400">Próximos atendimentos</p></div><Users className="h-4 w-4 text-violet-500" /></div>
            <div className="space-y-2">{[['CM', 'Carlos', 'Corte + barba', '09:30'], ['JL', 'Juliana', 'Coloração', '10:20'], ['MR', 'Mariana', 'Manicure', '11:10']].map(([initials, name, service, time], index) => <div key={time} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2"><span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[8px] font-bold', index === 0 ? 'bg-blue-100 text-blue-600' : index === 1 ? 'bg-violet-100 text-violet-600' : 'bg-orange-100 text-orange-600')}>{initials}</span><div className="min-w-0 flex-1"><p className="truncate text-[9px] font-bold text-slate-700">{name}</p><p className="truncate text-[8px] text-slate-400">{service}</p></div><span className="text-[8px] font-bold text-slate-500">{time}</span></div>)}</div>
          </div>
        </div>
      </div>
    </motion.div>

    <motion.div animate={reduceMotion ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-0 top-28 z-20 hidden w-14 flex-col items-center gap-4 rounded-2xl border border-white/90 bg-white py-4 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.45)] dark:border-white/10 dark:bg-[#0a1935] sm:flex">
      <img src={vizzuIcon} alt="" className="h-8 w-8 object-contain" />
      {[BarChart3, CalendarDays, Users, WalletCards].map((Icon, index) => <span key={index} className={cn('flex h-8 w-8 items-center justify-center rounded-xl', index === 0 ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-400')}><Icon className="h-4 w-4" /></span>)}
    </motion.div>

    <motion.div animate={reduceMotion ? undefined : { y: [0, 9, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-2 top-24 z-20 hidden w-36 rounded-2xl border border-white/90 bg-white p-3.5 shadow-[0_22px_55px_-22px_rgba(42,91,190,0.5)] dark:border-white/10 dark:bg-[#0a1935] sm:block">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-primary"><CalendarDays className="h-4 w-4" weight="duotone" /></span><p className="mt-3 text-[10px] font-black text-slate-800 dark:text-white">Agenda inteligente</p><p className="mt-1 text-[8px] leading-4 text-slate-400">Horários organizados sem conflito.</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full w-[84%] rounded-full bg-primary" /></div>
    </motion.div>

    <motion.div animate={reduceMotion ? undefined : { y: [0, -7, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-0 right-8 z-20 hidden w-36 rounded-2xl border border-white/90 bg-white p-3.5 shadow-[0_22px_55px_-22px_rgba(75,65,210,0.5)] dark:border-white/10 dark:bg-[#0a1935] sm:block">
      <p className="text-[9px] font-bold text-slate-800 dark:text-white">Desempenho</p><div className="mx-auto mt-2 flex h-20 w-20 items-center justify-center rounded-full bg-[conic-gradient(#4f46e5_0_84%,#e9e9ff_84%_100%)]"><div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white dark:bg-[#0a1935]"><span className="text-base font-black text-slate-900 dark:text-white">84%</span><span className="text-[7px] text-emerald-500">+12%</span></div></div><p className="mt-2 text-center text-[8px] text-slate-400">Agenda ocupada</p>
    </motion.div>

    <motion.div animate={reduceMotion ? undefined : { x: [0, 6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-8 left-6 z-20 hidden items-center gap-2 rounded-2xl border border-white/90 bg-white px-3.5 py-3 shadow-[0_22px_55px_-22px_rgba(42,91,190,0.5)] dark:border-white/10 dark:bg-[#0a1935] sm:left-16 sm:flex">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Check className="h-4 w-4" weight="bold" /></span><div><p className="text-[9px] font-black text-slate-800 dark:text-white">Operação organizada</p><p className="text-[8px] text-slate-400">Tudo conectado no VIZZU</p></div>
    </motion.div>
  </motion.div>
  );
};

const HeroShowcase = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto h-[340px] w-full max-w-[1180px] sm:h-[460px] xl:h-[540px]">
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center">
        <motion.img
          src={heroDashboard}
          alt="Dashboard VIZZU com agenda, indicadores e gestão financeira"
          className="w-[94%] max-w-[980px] rounded-2xl object-contain shadow-[0_32px_70px_-38px_rgba(15,47,107,0.48)] sm:w-[88%] xl:w-[84%]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.72, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <motion.div
        className="pointer-events-none absolute bottom-0 left-[-3%] z-20 hidden h-[98%] sm:block xl:left-[-5%] xl:h-[104%]"
        initial={reduceMotion ? false : { opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.85, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={heroWoman}
          alt="Profissional utilizando o VIZZU em um tablet"
          className="h-full w-auto -scale-x-100 object-contain"
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute bottom-0 right-[-3%] z-20 hidden h-[98%] sm:block xl:right-[-5%] xl:h-[104%]"
        initial={reduceMotion ? false : { opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.85, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={heroMan}
          alt="Profissional utilizando o VIZZU no celular"
          className="h-full w-auto object-contain"
        />
      </motion.div>
    </div>
  );
};

const PlanIcon = ({ type }: { type: string }): ReactNode => {
  if (type === 'pro') return <Crown className="h-5 w-5" />;
  if (type === 'enterprise') return <ShieldCheck className="h-5 w-5" />;
  if (type === 'trial') return <Sparkles className="h-5 w-5" />;
  return <Star className="h-5 w-5" />;
};

const SalesPage = () => {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const [showHeader, setShowHeader] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [heroMessageIndex, setHeroMessageIndex] = useState(0);
  const isDark = themeReady && resolvedTheme === 'dark';
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

  useEffect(() => {
    setThemeReady(true);
    const updateHeaderVisibility = () => setShowHeader(window.scrollY > 120);

    updateHeaderVisibility();
    window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateHeaderVisibility);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const messageTimer = window.setInterval(() => {
      setHeroMessageIndex((current) => (current + 1) % heroMessages.length);
    }, 4200);
    return () => window.clearInterval(messageTimer);
  }, [reduceMotion]);

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className="min-h-screen scroll-smooth overflow-x-hidden bg-white text-slate-950 transition-colors duration-500 dark:bg-[#030817] dark:text-white">
      {!showHeader && themeReady && (
        <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
          <ThemeSwitch isDark={isDark} onToggle={toggleTheme} />
        </div>
      )}
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 px-4 pt-4 transition-all duration-300 sm:px-6',
          showHeader ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-5 opacity-0',
        )}
        aria-hidden={!showHeader}
      >
        <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between rounded-[22px] border border-white/80 bg-[#f7fbff]/90 px-4 shadow-[0_18px_45px_-28px_rgba(15,47,107,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85 sm:px-7">
          <button className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao início" tabIndex={showHeader ? 0 : -1}>
            <img src={vizzuIcon} alt="VIZZU" className="h-12 w-12 object-contain drop-shadow-sm" />
            <span className="text-2xl font-black tracking-[0.06em] text-[#0F2F6B] dark:text-white">VIZZU</span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 lg:flex dark:text-slate-200">
            <a href="#recursos" className="transition-colors hover:text-primary" tabIndex={showHeader ? 0 : -1}>Recursos</a>
            <a href="#para-quem" className="transition-colors hover:text-primary" tabIndex={showHeader ? 0 : -1}>Para quem é</a>
            <a href="#planos" className="transition-colors hover:text-primary" tabIndex={showHeader ? 0 : -1}>Preços</a>
            <a href="#duvidas" className="transition-colors hover:text-primary" tabIndex={showHeader ? 0 : -1}>Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            {themeReady && <ThemeSwitch isDark={isDark} onToggle={toggleTheme} compact />}
            <Button variant="ghost" className="hidden font-semibold text-primary sm:inline-flex" onClick={() => navigate('/login')} tabIndex={showHeader ? 0 : -1}>Entrar</Button>
            <Button className="rounded-xl px-4 shadow-lg shadow-primary/25 sm:px-5" onClick={() => navigate('/cadastro?plano=trial')} tabIndex={showHeader ? 0 : -1}>Testar grátis <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      </header>
      <main>
        <section className="relative isolate overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:min-h-[720px] lg:pb-16">
          <div className="pointer-events-none absolute inset-0 -z-20 bg-white dark:bg-[radial-gradient(circle_at_16%_18%,rgba(37,99,235,0.2),transparent_34%),radial-gradient(circle_at_84%_10%,rgba(99,102,241,0.16),transparent_30%),linear-gradient(135deg,#020617_0%,#071b3e_50%,#030712_100%)]" />
          <motion.div className="pointer-events-none absolute -left-32 top-10 -z-10 h-96 w-96 rounded-full border border-blue-300/30 dark:border-blue-400/10" animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], x: [0, 18, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="pointer-events-none absolute -right-28 top-20 -z-10 h-[420px] w-[420px] rounded-full border border-blue-300/30 dark:border-blue-400/10" animate={reduceMotion ? undefined : { scale: [1.08, 1, 1.08], y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <div className="mx-auto grid max-w-[1600px] items-center gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
            <motion.div
              className="relative z-30"
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 flex items-center gap-3 sm:gap-4">
                <img
                  src={vizzuIcon}
                  alt="Logo VIZZU"
                  className="h-24 w-24 shrink-0 object-contain drop-shadow-[0_20px_25px_rgba(37,99,235,0.24)] sm:h-32 sm:w-32"
                />
                <div>
                  <p className="text-[42px] font-black leading-none tracking-[0.08em] text-[#0F2F6B] sm:text-[58px] dark:text-white">VIZZU</p>
                  <p className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-primary sm:text-xs">
                    <Zap className="h-3.5 w-3.5 shrink-0" weight="duotone" /> Gestão completa para negócios de serviços
                  </p>
                </div>
              </div>
              <div className="relative h-[190px] min-[440px]:h-[150px] sm:h-[150px] lg:h-[188px]">
                <h1 className="absolute inset-x-0 top-0 z-40 max-w-2xl text-4xl font-black leading-[1.03] tracking-[-0.045em] lg:text-[48px]">
                  {heroMessages[heroMessageIndex].first}{' '}
                  <span className="bg-gradient-to-r from-[#2878ef] via-[#1557b8] to-[#0F2F6B] bg-clip-text text-transparent dark:from-blue-300 dark:to-blue-100">
                    {heroMessages[heroMessageIndex].second}
                  </span>
                </h1>
              </div>
              <p className="mt-5 max-w-xl text-[15px] leading-6 text-slate-600 dark:text-slate-300">
                Centralize agendamentos, clientes, equipe e financeiro em um sistema simples de usar. Enquanto o VIZZU organiza a operação, você ganha tempo para atender melhor e crescer.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="group h-13 rounded-xl px-7 text-base shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5" onClick={() => navigate('/cadastro?plano=trial')}>
                  Testar grátis por 7 dias <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                {['Sem cartão de crédito', 'Configuração guiada', 'Cancele quando quiser'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />{item}</span>
                ))}
              </div>
            </motion.div>
            <div className="relative z-10">
              <HeroShowcase />
            </div>
          </div>
          <Reveal className="mx-auto mt-14 flex max-w-xl flex-col gap-4 rounded-2xl border border-blue-100 bg-white px-6 py-5 shadow-[0_16px_44px_-30px_rgba(15,47,107,0.4)] dark:border-white/10 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
              <div className="flex items-start gap-2.5">
                <Star className="mt-0.5 h-5 w-5 fill-amber-400 text-amber-400" weight="fill" />
                <div><p className="text-lg font-black text-slate-950 dark:text-white">+350 negócios</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">já organizam sua rotina<br />com o VIZZU</p></div>
              </div>
              <div className="h-px w-full bg-slate-200 sm:h-14 sm:w-px dark:bg-slate-700" />
              <div>
                <p className="text-lg font-black text-slate-950 dark:text-white">4,9/5</p>
                <div className="mt-1 flex gap-0.5" aria-label="Avaliação de 4,9 de 5 estrelas">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" weight="fill" />)}</div>
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Baseado em 230+ avaliações</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="mx-auto mt-7 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {proofHighlights.map((item) => <motion.div whileHover={reduceMotion ? undefined : { y: -6 }} key={item.label} className="flex min-h-[238px] flex-col rounded-2xl border border-blue-100 bg-white px-6 py-6 shadow-[0_18px_42px_-26px_rgba(15,47,107,0.45)] dark:border-white/10 dark:bg-slate-900/70"><span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm', item.color)}><item.icon className="h-6 w-6" weight="duotone" /></span><div className="mt-5"><p className="text-lg font-black text-slate-950 dark:text-white">{item.value}</p><p className="mt-2 text-sm font-bold leading-5 text-slate-800 dark:text-slate-100">{item.label}</p><p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.detail}</p></div></motion.div>)}
          </Reveal>

          <Reveal className="mx-auto mt-8 max-w-7xl border-y border-slate-200/80 py-6 dark:border-slate-800">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Negócios que já organizam sua rotina com o VIZZU</p>
            <div className="mt-5 grid grid-cols-2 items-center gap-x-6 gap-y-5 text-center text-sm font-semibold text-slate-400 sm:grid-cols-3 lg:grid-cols-5">
              {trustedBusinesses.map((business) => <span key={business} className="whitespace-nowrap opacity-70 grayscale transition hover:opacity-100">{business}</span>)}
            </div>
          </Reveal>

          <Reveal className="mx-auto mt-7 flex max-w-7xl flex-col items-start justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#194fae] via-[#286fe7] to-[#17499e] px-7 py-6 text-white shadow-[0_22px_55px_-30px_rgba(29,78,216,0.75)] sm:flex-row sm:items-center">
            <div><p className="text-xl font-black text-white">Pronto para organizar seu negócio e crescer?</p><p className="mt-1 text-sm text-blue-100">Comece agora. São 7 dias grátis e você não precisa cadastrar cartão.</p></div>
            <Button size="lg" variant="secondary" className="shrink-0 rounded-xl !bg-white px-7 font-bold !text-[#174a9e] shadow-lg hover:!bg-blue-50" onClick={() => navigate('/cadastro?plano=trial')}>Testar grátis por 7 dias <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Reveal>
        </section>

        <section id="recursos" className="relative scroll-mt-24 overflow-hidden border-y border-blue-100 bg-[#f7faff] px-4 py-16 dark:border-white/10 dark:bg-[#061024] sm:px-6 lg:py-24">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[480px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/35 blur-3xl dark:bg-blue-600/10" />
          <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_30px_80px_-48px_rgba(15,47,107,0.65)] dark:border-white/10 dark:bg-slate-950/75">
            <div className="grid items-center gap-10 p-7 sm:p-10 lg:grid-cols-[0.8fr_1.25fr_0.9fr] lg:gap-8 lg:p-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Feito para quem presta serviços</span>
                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-4xl">Tudo o que você precisa para gerir e crescer seu negócio</h2>
                <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">Do agendamento ao financeiro, o VIZZU reúne as ferramentas essenciais para sua rotina ficar mais organizada, produtiva e previsível.</p>
                <Button className="mt-7 rounded-xl px-6 shadow-lg shadow-primary/20" onClick={() => navigate('/cadastro?plano=trial')}>Começar teste gratuito <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>

              <motion.div whileHover={reduceMotion ? undefined : { y: -6 }} className="relative rounded-[24px] border border-blue-100 bg-[#f8fbff] p-3 shadow-[0_26px_60px_-35px_rgba(15,47,107,0.65)] dark:border-white/10 dark:bg-slate-900/70">
                <div className="mb-3 flex items-center gap-1.5 px-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
                <img src={heroDashboard} alt="Painel completo do VIZZU com agenda, clientes e indicadores" className="w-full rounded-[16px] object-cover shadow-sm" />
              </motion.div>

              <div className="space-y-5">
                {productCapabilities.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', item.color)}><item.icon className="h-5 w-5" weight="duotone" /></span>
                    <div><h3 className="font-black text-slate-950 dark:text-white">{item.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div id="para-quem" className="border-t border-slate-100 bg-slate-50/80 px-7 py-6 dark:border-slate-800 dark:bg-slate-900/45 sm:px-10 lg:px-12">
              <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Uma plataforma para diferentes negócios de serviços</p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {segments.map((segment) => <span key={segment.name} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"><segment.icon className="h-4 w-4 text-primary" weight="duotone" />{segment.name}</span>)}
              </div>
            </div>
          </Reveal>
        </section>

        {showLegacySalesSections && <div className="hidden" aria-hidden="true">

        <section className="relative scroll-mt-6 overflow-hidden border-y border-blue-200/70 bg-gradient-to-br from-[#dbe9ff] via-[#e9f2ff] to-[#dceaff] px-4 py-16 dark:border-white/10 dark:from-[#071126] dark:via-[#091631] dark:to-[#050b1c] sm:px-6 lg:py-20">
          <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/10" />
          <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-500/10" />
          <Reveal className="relative mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/65 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-blue-300">
                <StorefrontIcon className="h-4 w-4" weight="duotone" /> Feito para quem vive de atender bem
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">O VIZZU se adapta ao jeito do seu negócio</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">Da agenda ao relacionamento com o cliente, você organiza cada detalhe sem precisar mudar a forma como sua equipe trabalha.</p>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {segments.map((segment, index) => (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.055, duration: 0.5 }}
                  whileHover={reduceMotion ? undefined : { y: -5, scale: 1.015 }}
                  key={segment.name}
                  className="group relative flex min-h-[96px] items-center gap-4 overflow-hidden rounded-[22px] border border-blue-200/80 bg-white/70 p-4 shadow-[0_16px_35px_-28px_rgba(15,47,107,0.75)] backdrop-blur transition-colors hover:border-blue-300 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-blue-400/30 dark:hover:bg-white/[0.075]"
                >
                  <div className={cn('absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100', segment.glow)} />
                  <span className={cn('relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3', segment.iconTone)}>
                    <segment.icon className="h-6 w-6" weight="duotone" />
                  </span>
                  <div className="relative min-w-0 flex-1">
                    <p className="font-black text-slate-900 dark:text-white">{segment.name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{segment.detail}</p>
                  </div>
                  <ChevronRight className="relative h-4 w-4 shrink-0 -translate-x-1 text-blue-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" weight="bold" />
                </motion.div>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="relative scroll-mt-24 overflow-hidden px-4 py-20 sm:px-6 lg:py-28">
          <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-600/10" />
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto mb-12 max-w-3xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Menos improviso. Mais resultado.</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Tudo o que sua empresa precisa para vender, atender e crescer melhor</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">O VIZZU transforma agenda espalhada, informações soltas e contas manuais em uma rotina clara para você, sua equipe e seus clientes.</p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {outcomes.map((outcome, index) => (
                <Reveal key={outcome.title} delay={index * 0.08}>
                  <motion.div whileHover={reduceMotion ? undefined : { y: -8, rotateX: 2, rotateY: index % 2 ? -2 : 2 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} style={{ transformPerspective: 900 }}>
                  <Card className={cn('group h-full overflow-hidden rounded-3xl shadow-sm transition-shadow hover:shadow-xl', outcome.tone)}>
                    <CardContent className="p-7">
                      <div className={cn('mb-7 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3', outcome.iconTone)}><outcome.icon className="h-6 w-6" weight="duotone" /></div>
                      <h3 className="text-xl font-bold">{outcome.title}</h3>
                      <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{outcome.description}</p>
                      <div className="mt-6 flex items-center gap-1 text-sm font-bold text-primary">Tudo conectado <ChevronRight className="h-4 w-4" /></div>
                    </CardContent>
                  </Card>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-blue-200/70 bg-gradient-to-b from-[#dfeaff] to-[#edf4ff] px-4 py-20 sm:px-6 lg:py-28 dark:border-white/10 dark:from-[#071126] dark:to-[#050b1c]">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto mb-12 max-w-3xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Da rotina corrida ao negócio organizado</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">O VIZZU coloca sua operação em ordem, etapa por etapa</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Você começa pelo essencial e ganha uma visão cada vez mais clara do atendimento, da equipe e dos resultados.</p>
            </Reveal>

            <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="pointer-events-none absolute left-[12%] right-[12%] top-7 hidden h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent lg:block" />
              {organizationSteps.map((step, index) => (
                <motion.div initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: index * 0.1, duration: 0.6 }} whileHover={reduceMotion ? undefined : { y: -6 }} key={step.number} className="relative rounded-3xl border border-blue-200/80 bg-white/65 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.045]">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#387ff1] to-[#174a9e] text-sm font-black text-white shadow-lg shadow-blue-500/20">{step.number}</span>
                  <h3 className="mt-6 text-lg font-black text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <Reveal className="mt-14 overflow-hidden rounded-[32px] border border-blue-200/80 bg-[#f7fbff]/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/75">
              <div className="grid lg:grid-cols-2">
                <div className="border-b border-slate-200 p-7 sm:p-10 lg:border-b-0 lg:border-r dark:border-slate-800">
                  <div className="mb-7 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><X className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-rose-500">Sem organização</p><h3 className="text-xl font-black">A rotina depende de esforço e memória</h3></div></div>
                  <div className="space-y-4">{routineComparison.map((item) => <div key={item.before} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"><X className="mt-1 h-4 w-4 shrink-0 text-rose-400" />{item.before}</div>)}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 via-white to-violet-50 p-7 sm:p-10 dark:from-blue-950/30 dark:via-slate-950 dark:to-violet-950/20">
                  <div className="mb-7 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><Check className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600">Com o VIZZU</p><h3 className="text-xl font-black">A operação funciona com mais clareza</h3></div></div>
                  <div className="space-y-4">{routineComparison.map((item) => <div key={item.after} className="flex gap-3 text-sm font-medium leading-6 text-slate-700 dark:text-slate-200"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{item.after}</div>)}</div>
                  <Button className="mt-8 rounded-xl px-6 shadow-lg shadow-primary/20" onClick={() => navigate('/cadastro?plano=trial')}>Começar teste gratuito <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        </div>}

        <section className="px-4 py-20 sm:px-6 lg:py-28">
          <Reveal className="mx-auto grid max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2f73da] via-[#174a9e] to-[#0f2f6b] text-white shadow-[0_35px_90px_-35px_rgba(15,47,107,0.8)] lg:grid-cols-[1fr_0.9fr]">
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
            <div className="relative flex min-h-[420px] items-end justify-center overflow-hidden bg-gradient-to-br from-blue-500/20 to-violet-400/15 px-5 pt-8 sm:min-h-[520px]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(96,165,250,0.32),transparent_48%)]" />
              <motion.img
                src={mobileDashboard}
                alt="VIZZU funcionando no celular com indicadores, atalhos e próximos agendamentos"
                initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                whileHover={reduceMotion ? undefined : { y: -8 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 max-h-[500px] w-auto max-w-full object-contain object-bottom drop-shadow-[0_30px_45px_rgba(0,0,0,0.35)]"
              />
            </div>
          </Reveal>
        </section>

        <section id="planos" className="scroll-mt-24 border-y border-blue-200/70 bg-gradient-to-b from-[#dce9ff] via-[#edf4ff] to-[#dfeaff] px-4 py-20 sm:px-6 lg:py-28 dark:border-white/10 dark:from-[#071126] dark:via-[#040a19] dark:to-[#071126]">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Planos flexíveis</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Comece no seu ritmo. Cresça sem trocar de sistema.</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Escolha o plano que acompanha o momento atual do seu negócio.</p>
            </Reveal>
            {isLoading ? <LoadingSpinner className="py-20" size={32} /> : (
              <><div className={cn('mx-auto grid items-stretch gap-5', plans.length <= 2 ? 'max-w-3xl md:grid-cols-2' : plans.length === 3 ? 'max-w-5xl md:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4')}>
                {plans.map((plan) => {
                  const popular = plan.plan_type === 'pro';
                  return (
                    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} whileHover={reduceMotion ? undefined : { y: -7 }} transition={{ duration: 0.55 }} key={plan.id} className="relative pt-3">
                      {popular && <div className="absolute inset-x-0 top-0 z-10 mx-auto w-fit rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg">Mais escolhido</div>}
                      <Card className={cn('flex h-full flex-col rounded-3xl border-blue-200/80 bg-white/75 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.045]', popular && 'border-primary shadow-xl shadow-primary/10 ring-1 ring-primary')}>
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
              <Reveal className="mt-16 overflow-hidden rounded-[28px] border border-blue-200/80 bg-[#f8fbff]/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/75">
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
              </Reveal></>
            )}
          </div>
        </section>

        <section id="duvidas" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:py-28">
          <Reveal className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Sem letras pequenas</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Dúvidas antes de começar?</h2>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">As respostas mais importantes para você entender como o VIZZU entra na rotina do seu negócio.</p>
              <div className="mt-7 flex items-center gap-3 rounded-2xl border border-blue-200/80 bg-white/65 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.045]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"><MessageCircleMore className="h-5 w-5" weight="duotone" /></div><div><p className="text-sm font-bold">Ainda precisa de ajuda?</p><p className="text-xs text-slate-500 dark:text-slate-400">Nossa equipe pode orientar você.</p></div></div>
            </div>
            <div>
              <Accordion type="single" collapsible className="rounded-3xl border border-blue-200/80 bg-white/70 px-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.045]">
                {faqs.map((faq, index) => <AccordionItem key={faq.q} value={`faq-${index}`}><AccordionTrigger className="py-5 text-left text-base font-bold hover:no-underline">{faq.q}</AccordionTrigger><AccordionContent className="pb-5 leading-7 text-slate-600 dark:text-slate-300">{faq.a}</AccordionContent></AccordionItem>)}
              </Accordion>
            </div>
          </Reveal>
        </section>

        <section className="px-4 pb-20 sm:px-6">
          <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-gradient-to-r from-[#2E6FD3] via-[#2257b3] to-[#0F2F6B] px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-16">
            <motion.div className="absolute -left-16 -top-16 h-48 w-48 rounded-full border border-white/10" animate={reduceMotion ? undefined : { scale: [1, 1.14, 1] }} transition={{ duration: 7, repeat: Infinity }} />
            <motion.div animate={reduceMotion ? undefined : { rotate: [0, 15, 0], scale: [1, 1.08, 1] }} transition={{ duration: 4, repeat: Infinity }}><Sparkles className="mx-auto h-8 w-8 text-blue-200" weight="duotone" /></motion.div>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Seu negócio pode ser mais organizado já no próximo atendimento.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100">Crie sua conta, configure seus serviços e compartilhe sua página de agendamento.</p>
            <Button size="lg" className="group mt-8 rounded-xl !bg-white px-8 !text-[#0F2F6B] shadow-lg shadow-slate-950/15 transition-transform hover:-translate-y-0.5 hover:!bg-blue-50" onClick={() => navigate('/cadastro?plano=trial')}>Começar teste gratuito <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" /></Button>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-blue-200/70 bg-[#dfeaff] px-4 py-8 dark:border-white/10 dark:bg-[#030817]">
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
