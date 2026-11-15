import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ban, Building, CalendarClock, Copy, ExternalLink, Eye, Loader2, LogIn, RefreshCw, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useSubscribers } from '@/hooks/useSuperAdmin';
import { supabase } from '@/integrations/supabase/client';
import type { PlatformBusiness } from '@/types/superAdmin';
import { startSupportImpersonation } from '@/lib/platformImpersonation';
import { useNavigate } from 'react-router-dom';

const statusLabel: Record<string, string> = {
  active: 'Ativa', expired: 'Expirada', suspended: 'Suspensa', cancelled: 'Cancelada', pending_payment: 'Pagamento pendente', missing: 'Sem assinatura',
};
const roleLabel: Record<string, string> = {
  admin: 'Dono do negócio', barbeiro: 'Profissional', professional: 'Profissional', cliente: 'Cliente', client: 'Cliente', super_admin: 'Super Admin',
};

const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(value))
  : '—';

const Businesses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<PlatformBusiness | null>(null);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform-businesses'],
    queryFn: async (): Promise<PlatformBusiness[]> => {
      const { data: result, error: invokeError } = await supabase.functions.invoke('list-platform-businesses');
      if (invokeError) throw invokeError;
      return (result?.businesses || []) as PlatformBusiness[];
    },
  });
  const { suspendSubscription, renewSubscription, isUpdating } = useSubscribers();

  const businesses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data || [];
    return (data || []).filter((business) => [business.company_name, business.owner_name, business.owner_email, business.plan_type, business.status]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [data, search]);

  const copyBookingLink = async (business: PlatformBusiness) => {
    try {
      await navigator.clipboard.writeText(business.public_booking_url);
      toast({ title: 'Link copiado', description: `Link de agendamento de ${business.company_name} copiado.` });
    } catch {
      toast({ title: 'Não foi possível copiar', description: 'Abra a página do negócio e copie o link pela barra do navegador.', variant: 'destructive' });
    }
  };

  const suspendBusiness = (business: PlatformBusiness) => {
    if (!business.subscription_id || !window.confirm(`Suspender o acesso de ${business.company_name}?`)) return;
    suspendSubscription(business.subscription_id);
    window.setTimeout(() => refetch(), 500);
  };

  const renewBusiness = (business: PlatformBusiness) => {
    if (!business.subscription_id) {
      toast({ title: 'Assinatura não encontrada', description: 'Crie ou vincule uma assinatura antes de renovar.', variant: 'destructive' });
      return;
    }
    const currentEnd = business.end_date ? new Date(business.end_date).getTime() : 0;
    const nextEnd = new Date(Math.max(currentEnd, Date.now()));
    nextEnd.setMonth(nextEnd.getMonth() + 1);
    renewSubscription(business.subscription_id, nextEnd.toISOString());
    window.setTimeout(() => refetch(), 500);
  };

  const impersonateBusiness = async (business: PlatformBusiness) => {
    if (!window.confirm(`Entrar como ${business.company_name}? A sessão do Super Admin será guardada neste navegador e poderá ser restaurada ao encerrar o modo suporte.`)) return;
    try {
      await startSupportImpersonation(business.user_id);
      toast({ title: 'Modo suporte iniciado', description: `Você está vendo o sistema como ${business.company_name}.` });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast({ title: 'Não foi possível entrar como esta empresa', description: error instanceof Error ? error.message : 'Tente novamente.', variant: 'destructive' });
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="Operação da plataforma" title="Empresas" subtitle="Consulte negócios, assinaturas, profissionais e links públicos de agendamento." />
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Empresas ({businesses.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empresa, dono ou plano" /></div>
              <Button variant="outline" size="icon" onClick={() => void refetch()} aria-label="Atualizar lista"><RefreshCw className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">Não foi possível carregar as empresas. Atualize a lista ou tente novamente.</div>
            ) : businesses.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Nenhuma empresa encontrada.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader><TableRow><TableHead>Empresa e dono</TableHead><TableHead>Plano</TableHead><TableHead>Status</TableHead><TableHead>Vencimento</TableHead><TableHead>Equipe</TableHead><TableHead>Link público</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>{businesses.map((business) => (
                    <TableRow key={business.user_id}>
                      <TableCell><div className="flex items-center gap-3">{business.logo_url ? <img src={business.logo_url} alt="" className="h-10 w-10 rounded-lg border object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted"><Building className="h-5 w-5 text-muted-foreground" /></span>}<div className="min-w-0"><p className="max-w-52 truncate font-semibold">{business.company_name}</p><p className="max-w-52 truncate text-xs text-muted-foreground">{business.owner_name || 'Dono não identificado'} · {business.owner_email || 'sem e-mail'}</p></div></div></TableCell>
                      <TableCell className="capitalize">{business.plan_type === 'basic' ? 'Essencial' : business.plan_type === 'pro' ? 'Profissional' : business.plan_type === 'enterprise' ? 'Premium' : business.plan_type || '—'}</TableCell>
                      <TableCell><Badge variant="outline">{statusLabel[business.status] || business.status}</Badge></TableCell>
                      <TableCell>{formatDate(business.end_date)}</TableCell>
                      <TableCell><span className="font-medium">{business.professional_count}</span> {business.professional_count === 1 ? 'profissional' : 'profissionais'}<br /><span className="text-xs text-muted-foreground">{business.linked_users.length} usuários</span></TableCell>
                      <TableCell><div className="flex items-center gap-1"><a className="max-w-40 truncate text-sm text-primary underline-offset-4 hover:underline" href={business.public_booking_url} target="_blank" rel="noreferrer">{business.public_page_enabled ? 'Abrir agendamento' : 'Página pausada'}</a><Button variant="ghost" size="icon" onClick={() => void copyBookingLink(business)} aria-label="Copiar link de agendamento"><Copy className="h-4 w-4" /></Button></div></TableCell>
                      <TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => setSelectedBusiness(business)} aria-label="Ver detalhes"><Eye className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => void impersonateBusiness(business)} aria-label={`Entrar como ${business.company_name}`} title="Entrar como empresa"><LogIn className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => renewBusiness(business)} disabled={isUpdating} aria-label="Renovar por um mês"><CalendarClock className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => suspendBusiness(business)} disabled={isUpdating || !business.subscription_id || business.status === 'suspended'} aria-label="Suspender empresa"><Ban className="h-4 w-4" /></Button></div></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedBusiness} onOpenChange={(open) => !open && setSelectedBusiness(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>{selectedBusiness?.company_name || 'Detalhes da empresa'}</DialogTitle></DialogHeader>
          {selectedBusiness && <div className="space-y-5">
            <div className="grid gap-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Dono</p><p className="font-medium">{selectedBusiness.owner_name || '—'}</p><p>{selectedBusiness.owner_email || '—'}</p></div><div><p className="text-xs text-muted-foreground">Contato</p><p>{selectedBusiness.phone || '—'}</p><p>{selectedBusiness.email || '—'}</p></div><div><p className="text-xs text-muted-foreground">Plano e status</p><p className="font-medium">{selectedBusiness.plan_type || 'Sem plano'} · {statusLabel[selectedBusiness.status] || selectedBusiness.status}</p></div><div><p className="text-xs text-muted-foreground">Página pública</p><a href={selectedBusiness.public_booking_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">Abrir link <ExternalLink className="h-3 w-3" /></a></div></div>
            <section><h3 className="mb-2 font-semibold">Usuários vinculados ({selectedBusiness.linked_users.length})</h3><div className="max-h-64 space-y-2 overflow-y-auto">{selectedBusiness.linked_users.map((linkedUser) => <div key={linkedUser.user_id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"><div className="min-w-0"><p className="truncate font-medium">{linkedUser.name}</p><p className="truncate text-xs text-muted-foreground">{linkedUser.email || 'sem e-mail'}</p></div><span className="shrink-0 text-xs text-muted-foreground">{linkedUser.roles.map((role) => roleLabel[role] || role).join(', ') || 'Dono do negócio'}</span></div>)}</div></section>
          </div>}
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
};

export default Businesses;
