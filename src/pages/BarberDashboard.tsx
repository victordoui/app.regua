import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, CalendarDays, CheckCircle2, DollarSign, Target, TrendingUp, UserRound, Wallet } from 'lucide-react';
import Layout from '@/components/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useProfessionalDashboard } from '@/hooks/useProfessionalDashboard';
import { useRole } from '@/contexts/RoleContext';
import { formatBusinessDateInput, formatDateInBusinessTimeZone } from '@/lib/formatters';

const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const percent = (value: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
const statusLabel: Record<string, string> = {
  pending: 'Aguardando',
  confirmed: 'Confirmado',
  completed: 'Concluído',
};

function MetricCard({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: typeof DollarSign }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      </CardContent>
    </Card>
  );
}

const BarberDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { teamProfileId, loading: roleLoading } = useRole();
  const { data, isLoading, error, refetch, saveGoal } = useProfessionalDashboard();
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (data?.monthlyGoal) setGoalInput(String(data.monthlyGoal.target_value));
  }, [data?.monthlyGoal]);

  const submitGoal = async () => {
    const target = Number(goalInput.replace(',', '.'));
    try {
      await saveGoal.mutateAsync(target);
      toast({ title: 'Meta pessoal salva', description: 'Seu progresso acompanha os atendimentos concluídos neste mês.' });
    } catch (saveError) {
      toast({ title: 'Não foi possível salvar a meta', description: saveError instanceof Error ? saveError.message : 'Tente novamente.', variant: 'destructive' });
    }
  };

  const appointmentList = (appointments: NonNullable<typeof data>['todayAppointments'], emptyText: string) => (
    appointments.length ? (
      <div className="divide-y divide-border">
        {appointments.map((appointment) => {
          const service = data?.servicesById.get(appointment.service_id);
          return (
            <div key={appointment.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-14 shrink-0 text-center">
                <p className="font-semibold tabular-nums">{appointment.appointment_time.slice(0, 5)}</p>
                {appointment.appointment_date !== formatBusinessDateInput() && (
                  <p className="text-[10px] capitalize text-muted-foreground">{format(parseISO(appointment.appointment_date), 'EEE, dd/MM', { locale: ptBR })}</p>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{service?.name || 'Atendimento'}</p>
                <p className="text-xs text-muted-foreground">{currency(Number(appointment.total_price ?? service?.price ?? 0))}</p>
              </div>
              <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>{statusLabel[appointment.status] || appointment.status}</Badge>
            </div>
          );
        })}
      </div>
    ) : <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
  );

  return (
    <Layout>
      <main className="page-container space-y-6">
        <PageHeader
          eyebrow="Meu trabalho"
          icon={<CalendarDays className="h-5 w-5" />}
          title={data ? `Olá, ${data.professionalName}` : 'Meu Painel'}
          subtitle="Acompanhe seus horários, resultados e comissões em um só lugar."
        ><Button onClick={() => navigate('/appointments')}><CalendarDays className="mr-2 h-4 w-4" />Abrir agenda</Button></PageHeader>

        {roleLoading || isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Carregando painel">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : !teamProfileId ? (
          <Card><CardContent className="flex items-start gap-3 p-6"><AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" /><div><p className="font-semibold">Perfil profissional não vinculado</p><p className="mt-1 text-sm text-muted-foreground">Peça ao dono do negócio para concluir seu acesso em Usuários.</p></div></CardContent></Card>
        ) : error ? (
          <Card><CardContent className="flex flex-col items-start gap-3 p-6"><p className="font-semibold">Não foi possível carregar seus dados.</p><p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Verifique sua conexão e tente novamente.'}</p><Button variant="outline" onClick={() => void refetch()}>Tentar novamente</Button></CardContent></Card>
        ) : data ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Resumo do profissional">
              <MetricCard title="Faturamento no mês" value={currency(data.monthlyRevenue)} detail={`${data.completedCount} atendimento${data.completedCount === 1 ? '' : 's'} concluído${data.completedCount === 1 ? '' : 's'}`} icon={DollarSign} />
              <MetricCard title="Gorjetas no mês" value={currency(data.monthlyTips)} detail="Informadas ao concluir atendimentos" icon={DollarSign} />
              <MetricCard title="Ocupação estimada" value={data.occupancy === null ? 'Sem escala' : `${percent(data.occupancy)}%`} detail="Horários agendados ÷ horas dos seus turnos no mês" icon={TrendingUp} />
              <MetricCard title="Ticket médio" value={currency(data.averageTicket)} detail="Média dos atendimentos concluídos no mês" icon={Wallet} />
              <MetricCard title="Faltas sem aviso" value={String(data.noShows)} detail="Agendamentos marcados como não compareceu" icon={UserRound} />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                  <div><CardTitle className="text-lg">Agenda de hoje</CardTitle><p className="mt-1 text-sm capitalize text-muted-foreground">{formatDateInBusinessTimeZone(new Date().toISOString(), { weekday: 'long', day: '2-digit', month: 'long' })}</p></div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>Ver agenda</Button>
                </CardHeader>
                <CardContent>{appointmentList(data.todayAppointments, 'Você não tem atendimentos para hoje.')}</CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-lg">Próximos horários</CardTitle><p className="text-sm text-muted-foreground">Seus próximos atendimentos confirmados ou aguardando.</p></CardHeader>
                <CardContent>{appointmentList(data.upcomingAppointments, 'Nenhum próximo horário agendado.')}</CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Wallet className="h-5 w-5 text-primary" />Comissões</CardTitle><p className="text-sm text-muted-foreground">Valores registrados neste mês.</p></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">A receber</span><strong>{currency(data.pendingCommission)}</strong></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Pagas</span><strong>{currency(data.paidCommission)}</strong></div>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/commissions')}>Ver detalhes das comissões</Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-primary" />Meta pessoal do mês</CardTitle><p className="text-sm text-muted-foreground">Defina um objetivo de faturamento para acompanhar.</p></CardHeader>
                <CardContent className="space-y-3">
                  {data.monthlyGoal && <Progress value={Math.min(100, (data.monthlyRevenue / Number(data.monthlyGoal.target_value)) * 100)} aria-label="Progresso da meta mensal" />}
                  <div className="flex items-end gap-2">
                    <label className="flex-1 space-y-1 text-xs font-medium text-muted-foreground" htmlFor="professional-monthly-goal">Meta em reais
                      <Input id="professional-monthly-goal" inputMode="decimal" type="number" min="1" step="0.01" value={goalInput} onChange={(event) => setGoalInput(event.target.value)} placeholder="Ex.: 5000" />
                    </label>
                    <Button onClick={() => void submitGoal()} disabled={saveGoal.isPending || !goalInput}>{saveGoal.isPending ? 'Salvando…' : 'Salvar meta'}</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{data.monthlyGoal ? `${currency(data.monthlyRevenue)} de ${currency(Number(data.monthlyGoal.target_value))} atingidos` : 'A meta é pessoal e pode ser ajustada por você.'}</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-primary" />Serviços em destaque</CardTitle><p className="text-sm text-muted-foreground">Ordenados pelo faturamento do mês.</p></CardHeader>
                <CardContent>
                  {data.topServices.length ? <div className="space-y-3">{data.topServices.map((service, index) => <div key={service.id} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{service.name}</p><p className="text-xs text-muted-foreground">{service.count} atendimento{service.count === 1 ? '' : 's'}</p></div><strong className="text-sm">{currency(service.revenue)}</strong></div>)}</div> : <p className="py-4 text-center text-sm text-muted-foreground">Os serviços concluídos aparecerão aqui.</p>}
                </CardContent>
              </Card>
            </section>

          </>
        ) : null}
      </main>
    </Layout>
  );
};

export default BarberDashboard;
