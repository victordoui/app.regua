import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Calendar, Users, CalendarCheck, Zap, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SubscriptionData } from '@/hooks/useMySubscription';

const planColors: Record<string, string> = {
  trial: 'bg-muted text-muted-foreground',
  basic: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  pro: 'bg-primary/10 text-primary border-primary/20',
  enterprise: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  suspended: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  expired: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
  expired: 'Expirado',
};

interface SubscriptionInfoCardProps {
  data: SubscriptionData;
}

const SubscriptionInfoCard = ({ data }: SubscriptionInfoCardProps) => {
  const { subscription, planConfig, usage, daysRemaining, progressPercent } = data;

  if (!subscription) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Crown className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Nenhuma assinatura encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  const features = subscription.features as string[] | null;

  return (
    <div className="space-y-4">
      {/* Plan & Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-primary" />
            {planConfig?.display_name || subscription.plan_type}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={planColors[subscription.plan_type] || planColors.trial}>
              {subscription.plan_type.toUpperCase()}
            </Badge>
            <Badge className={statusColors[subscription.status] || statusColors.expired}>
              {statusLabels[subscription.status] || subscription.status}
            </Badge>
          </div>

          {planConfig?.price_monthly != null && (
            <p className="text-2xl font-bold text-foreground">
              R$ {Number(planConfig.price_monthly).toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dates & Progress */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="text-sm font-medium">
                  {subscription.start_date
                    ? format(new Date(subscription.start_date), 'dd/MM/yyyy', { locale: ptBR })
                    : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Término</p>
                <p className="text-sm font-medium">
                  {subscription.end_date
                    ? format(new Date(subscription.end_date), 'dd/MM/yyyy', { locale: ptBR })
                    : 'Indeterminado'}
                </p>
              </div>
            </div>
          </div>

          {daysRemaining !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Tempo restante
                </span>
                <span className="font-medium">
                  {daysRemaining === 0 ? 'Expirado' : `${daysRemaining} dias`}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{progressPercent}% consumido</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Limits & Usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Limites e Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Barbeiros
            </span>
            <span className="text-sm font-medium">
              {usage.barbersCount} / {subscription.max_barbers ?? '∞'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarCheck className="h-4 w-4" />
              Agendamentos (mês)
            </span>
            <span className="text-sm font-medium">
              {usage.appointmentsThisMonth} / {subscription.max_appointments_month ?? '∞'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      {features && features.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Funcionalidades Incluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  {feat}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionInfoCard;
