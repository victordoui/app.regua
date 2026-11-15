import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Ban, Building2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformUserActions } from '@/hooks/superadmin/usePlatformUserActions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FraudAlert = {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'high' | 'medium';
  users: Array<{ user_id: string; name: string; email: string | null; company_name: string | null; subscription_id: string | null }>;
};

const FraudAlertsCard = () => {
  const queryClient = useQueryClient();
  const { runAction, isUpdating } = usePlatformUserActions();
  const { toast } = useToast();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['platform-fraud-alerts'],
    queryFn: async () => {
      const { data: result, error: invokeError } = await supabase.functions.invoke('list-platform-fraud-alerts');
      if (invokeError) throw invokeError;
      if (result?.error) throw new Error('FRAUD_ALERTS_UNAVAILABLE');
      return result as { alerts: FraudAlert[]; signal_coverage: { signup_signals: number; ip_signals: number; device_signals: number } };
    },
    retry: false,
  });

  const suspend = async (user: FraudAlert['users'][number]) => {
    const action = user.subscription_id ? 'suspend' : 'ban';
    const actionLabel = action === 'suspend' ? 'suspender a assinatura de' : 'bloquear o acesso de';
    if (!window.confirm(`Deseja ${actionLabel} ${user.company_name || user.name}? Confira os dados do alerta antes de continuar.`)) return;
    try {
      await runAction({ action, targetUserId: user.user_id });
      await queryClient.invalidateQueries({ queryKey: ['platform-fraud-alerts'] });
    } catch {
      // O hook exibe a mensagem de erro para o operador.
    }
  };

  const alerts = data?.alerts || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-600" />Alertas antifraude <Badge variant="outline">{alerts.length}</Badge></CardTitle>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching} aria-label="Atualizar alertas"><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />Atualizar</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div> : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível consultar os alertas antifraude.</div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" /><p>{data?.signal_coverage.signup_signals ? `Nenhum sinal suspeito foi encontrado entre ${data.signal_coverage.signup_signals} novos cadastros analisados. Cadastros anteriores a esta coleta não têm IP ou dispositivo registrado.` : 'Nenhum sinal suspeito foi encontrado. A coleta começa nos novos cadastros; cadastros anteriores não têm IP ou dispositivo registrado.'}</p></div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <article key={alert.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0"><div className="flex items-center gap-2"><h3 className="font-semibold">{alert.title}</h3><Badge variant={alert.severity === 'high' ? 'destructive' : 'outline'}>{alert.severity === 'high' ? 'Atenção' : 'Revisar'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{alert.description}</p></div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {alert.users.map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
                      <div className="min-w-0"><p className="truncate text-sm font-medium">{user.company_name || user.name}</p><p className="truncate text-xs text-muted-foreground">{user.email || 'sem e-mail'}{user.company_name ? ` · ${user.name}` : ''}</p></div>
                      <Button size="sm" variant="outline" className="shrink-0" disabled={isUpdating} onClick={() => void suspend(user)} title={user.subscription_id ? 'Suspender assinatura' : 'Bloquear acesso'}>
                        {user.subscription_id ? <Building2 className="mr-1.5 h-3.5 w-3.5" /> : <Ban className="mr-1.5 h-3.5 w-3.5" />}{user.subscription_id ? 'Suspender' : 'Bloquear'}
                      </Button>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FraudAlertsCard;
