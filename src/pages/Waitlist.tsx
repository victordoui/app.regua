import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWaitlist } from '@/hooks/useWaitlist';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Users, Plus, Bell, Calendar, Trash2, Loader2, CheckCircle } from 'lucide-react';

const Waitlist = () => {
  const { waitlist, stats, isLoading, addToWaitlist, updateStatus, removeFromWaitlist, isAdding } = useWaitlist();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ client_name: '', client_phone: '', preferred_date: '' });

  const handleSubmit = async () => {
    if (!formData.client_name || !formData.client_phone) return;
    await addToWaitlist(formData);
    setDialogOpen(false);
    setFormData({ client_name: '', client_phone: '', preferred_date: '' });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      waiting: { label: 'Aguardando', variant: 'outline' },
      notified: { label: 'Notificado', variant: 'secondary' },
      booked: { label: 'Agendado', variant: 'default' },
      expired: { label: 'Expirado', variant: 'destructive' }
    };
    const c = config[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold tracking-tight">Lista de Espera</h1><p className="text-muted-foreground">Gerencie clientes aguardando horários</p></div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Adicionar</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo na Lista</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input value={formData.client_name} onChange={e => setFormData(p => ({ ...p, client_name: e.target.value }))} /></div>
                <div><Label>Telefone</Label><Input value={formData.client_phone} onChange={e => setFormData(p => ({ ...p, client_phone: e.target.value }))} /></div>
                <div><Label>Data Preferida</Label><Input type="date" value={formData.preferred_date} onChange={e => setFormData(p => ({ ...p, preferred_date: e.target.value }))} /></div>
                <Button onClick={handleSubmit} disabled={isAdding} className="w-full">{isAdding && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-yellow-500" /><span className="text-sm text-muted-foreground">Aguardando</span></div><p className="text-3xl font-bold mt-2">{stats.waiting}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Bell className="h-5 w-5 text-blue-500" /><span className="text-sm text-muted-foreground">Notificados</span></div><p className="text-3xl font-bold mt-2">{stats.notified}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-sm text-muted-foreground">Agendados</span></div><p className="text-3xl font-bold mt-2">{stats.booked}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">Total</span></div><p className="text-3xl font-bold mt-2">{stats.total}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Clientes na Lista</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : waitlist.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Lista de espera vazia</p></div>
            ) : (
              <div className="space-y-3">
                {waitlist.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.client_name}</p>
                        <p className="text-sm text-muted-foreground">{item.client_phone}</p>
                        {item.preferred_date && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" />{format(new Date(item.preferred_date), 'dd/MM/yyyy')}</p>}
                        <div className="flex gap-2 mt-2">{getStatusBadge(item.status)}{item.service && <Badge variant="outline">{item.service.name}</Badge>}</div>
                      </div>
                      <div className="flex gap-2">
                        {item.status === 'waiting' && <Button size="sm" variant="outline" onClick={() => updateStatus({ id: item.id, status: 'notified' })}><Bell className="h-4 w-4 mr-1" />Notificar</Button>}
                        {item.status === 'notified' && <Button size="sm" onClick={() => updateStatus({ id: item.id, status: 'booked' })}><CheckCircle className="h-4 w-4 mr-1" />Agendar</Button>}
                        <Button size="icon" variant="ghost" onClick={() => removeFromWaitlist(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Waitlist;
