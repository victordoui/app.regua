import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useReferrals, ReferralFormData } from '@/hooks/useReferrals';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { Crown, Gift, Plus, Star, Users, Trash2, Loader2, UserPlus, Clock, CheckCircle, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader } from '@/components/ui/page-header';
import { StatusCards } from '@/components/ui/status-cards';

const Loyalty = () => {
  const { loyaltyPoints, rewards, stats, isLoading, createReward, deleteReward, isCreatingReward } = useLoyalty();
  const { referrals, isLoading: isLoadingReferrals, addReferral, markRewardGiven, generateReferralCode, isAdding, isMarking } = useReferrals();
  const { clients, isLoading: isLoadingClients } = useClients();
  const { toast } = useToast();

  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);
  const [rewardForm, setRewardForm] = useState({ name: '', points_required: '', reward_type: 'discount' as const, reward_value: '' });
  const [referralForm, setReferralForm] = useState<ReferralFormData>({ referrer_client_id: '', referred_client_id: '', referral_code: '', reward_amount: 20 });
  const [referralTab, setReferralTab] = useState('all');

  const handleCreateReward = async () => {
    if (!rewardForm.name || !rewardForm.points_required) return;
    await createReward({ name: rewardForm.name, points_required: Number(rewardForm.points_required), reward_type: rewardForm.reward_type, reward_value: rewardForm.reward_value ? Number(rewardForm.reward_value) : undefined });
    setRewardDialogOpen(false);
    setRewardForm({ name: '', points_required: '', reward_type: 'discount', reward_value: '' });
  };

  const handleReferrerSelect = (clientId: string) => { const client = clients.find(c => c.id === clientId); setReferralForm({ ...referralForm, referrer_client_id: clientId, referral_code: client ? generateReferralCode(client.name) : '' }); };
  const handleCreateReferral = async () => {
    if (!referralForm.referrer_client_id || !referralForm.referred_client_id) { toast({ title: 'Campos obrigatórios', variant: 'destructive' }); return; }
    if (referralForm.referrer_client_id === referralForm.referred_client_id) { toast({ title: 'Clientes iguais', variant: 'destructive' }); return; }
    await addReferral(referralForm);
    setReferralDialogOpen(false);
    setReferralForm({ referrer_client_id: '', referred_client_id: '', referral_code: '', reward_amount: 20 });
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast({ title: 'Código copiado!', description: code }); };
  const referralStats = { total: referrals.length, pending: referrals.filter(r => !r.reward_given).length, rewarded: referrals.filter(r => r.reward_given).length, totalRewards: referrals.filter(r => r.reward_given).reduce((sum, r) => sum + (r.reward_amount || 0), 0) };
  const filteredReferrals = referralTab === 'all' ? referrals : referralTab === 'pending' ? referrals.filter(r => !r.reward_given) : referrals.filter(r => r.reward_given);

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <PageHeader icon={<Crown className="h-5 w-5" />} title="Fidelidade & Indicações" subtitle="Programa de pontos e indicações" />

        <Tabs defaultValue="loyalty" className="space-y-6">
          <TabsList>
            <TabsTrigger value="loyalty" className="gap-2"><Star className="h-4 w-4" />Pontos & Recompensas</TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2"><UserPlus className="h-4 w-4" />Indicações</TabsTrigger>
          </TabsList>

          <TabsContent value="loyalty" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Recompensa</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Criar Recompensa</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Nome</Label><Input value={rewardForm.name} onChange={e => setRewardForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Corte Grátis" /></div>
                    <div><Label>Pontos Necessários</Label><Input type="number" value={rewardForm.points_required} onChange={e => setRewardForm(p => ({ ...p, points_required: e.target.value }))} /></div>
                    <div><Label>Tipo</Label><Select value={rewardForm.reward_type} onValueChange={(v: any) => setRewardForm(p => ({ ...p, reward_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="discount">Desconto</SelectItem><SelectItem value="service">Serviço Grátis</SelectItem><SelectItem value="product">Produto</SelectItem></SelectContent></Select></div>
                    {rewardForm.reward_type === 'discount' && <div><Label>Valor (R$)</Label><Input type="number" value={rewardForm.reward_value} onChange={e => setRewardForm(p => ({ ...p, reward_value: e.target.value }))} /></div>}
                    <Button onClick={handleCreateReward} disabled={isCreatingReward} className="w-full">{isCreatingReward && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Criar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <StatusCards
              className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              items={[
                { label: "Clientes", value: stats.totalClients, icon: <Users className="h-5 w-5" />, color: "blue" },
                { label: "Pontos Distribuídos", value: stats.totalPointsDistributed, icon: <Star className="h-5 w-5" />, color: "amber" },
                { label: "Pontos Resgatados", value: stats.totalPointsRedeemed, icon: <Gift className="h-5 w-5" />, color: "green" },
                { label: "Recompensas Ativas", value: stats.activeRewards, icon: <Crown className="h-5 w-5" />, color: "purple" },
              ]}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border/40 bg-card shadow-sm">
                <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Recompensas Disponíveis</h3></div>
                <div className="p-5">
                  {rewards.length === 0 ? <div className="text-center py-8 text-muted-foreground"><Gift className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Nenhuma recompensa cadastrada</p></div>
                  : <div className="space-y-3">{rewards.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                      <div><p className="font-medium">{r.name}</p><div className="flex items-center gap-2 mt-1"><Badge variant="secondary">{r.points_required} pts</Badge><Badge variant="outline">{r.reward_type === 'discount' ? 'Desconto' : r.reward_type === 'service' ? 'Serviço' : 'Produto'}</Badge></div></div>
                      <Button size="icon" variant="ghost" onClick={() => deleteReward(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}</div>}
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-card shadow-sm">
                <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Ranking de Clientes</h3></div>
                <div className="p-5">
                  {loyaltyPoints.length === 0 ? <div className="text-center py-8 text-muted-foreground"><Crown className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>Nenhum cliente com pontos</p></div>
                  : <div className="space-y-3">{loyaltyPoints.slice(0, 10).map((lp, i) => (
                    <div key={lp.id} className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                      <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div><div><p className="font-medium">{lp.client?.name || 'Cliente'}</p><p className="text-xs text-muted-foreground">{lp.client?.phone}</p></div></div>
                      <Badge>{lp.points} pts</Badge>
                    </div>
                  ))}</div>}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <div className="flex justify-end"><Button onClick={() => setReferralDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Indicação</Button></div>

            <StatusCards
              className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              items={[
                { label: "Total", value: referralStats.total, icon: <Users className="h-5 w-5" />, color: "blue" },
                { label: "Pendentes", value: referralStats.pending, icon: <Clock className="h-5 w-5" />, color: "amber" },
                { label: "Recompensados", value: referralStats.rewarded, icon: <CheckCircle className="h-5 w-5" />, color: "green" },
                { label: "Total Recompensas", value: `R$ ${referralStats.totalRewards.toFixed(2)}`, icon: <Gift className="h-5 w-5" />, color: "purple" },
              ]}
            />

            <div className="rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="p-5 border-b border-border/40">
                <Tabs value={referralTab} onValueChange={setReferralTab}><TabsList><TabsTrigger value="all">Todas</TabsTrigger><TabsTrigger value="pending">Pendentes</TabsTrigger><TabsTrigger value="rewarded">Recompensadas</TabsTrigger></TabsList></Tabs>
              </div>
              <div className="p-5">
                {isLoadingReferrals ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                : filteredReferrals.length === 0 ? <div className="text-center py-12"><UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" /><p className="text-muted-foreground">Nenhuma indicação encontrada.</p></div>
                : <div className="overflow-x-auto"><Table>
                  <TableHeader><TableRow><TableHead>Quem Indicou</TableHead><TableHead>Indicado</TableHead><TableHead>Código</TableHead><TableHead>Recompensa</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>{filteredReferrals.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.referrer?.name || 'N/A'}</TableCell>
                      <TableCell>{r.referred?.name || 'N/A'}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><code className="px-2 py-1 bg-muted rounded text-sm">{r.referral_code}</code><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(r.referral_code)}><Copy className="h-3 w-3" /></Button></div></TableCell>
                      <TableCell>{r.reward_amount ? `R$ ${r.reward_amount.toFixed(2)}` : '-'}</TableCell>
                      <TableCell>{r.reward_given ? <Badge className="bg-green-500/20 text-green-600 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Entregue</Badge> : <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>}</TableCell>
                      <TableCell>{format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell className="text-right">{!r.reward_given && <Button variant="outline" size="sm" onClick={() => markRewardGiven(r.id)} disabled={isMarking}>{isMarking ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Gift className="h-4 w-4 mr-2" />Entregar</>}</Button>}</TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table></div>}
              </div>
            </div>

            <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova Indicação</DialogTitle><DialogDescription>Registre uma indicação.</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div><Label>Quem Indicou</Label><Select value={referralForm.referrer_client_id} onValueChange={handleReferrerSelect}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Indicado</Label><Select value={referralForm.referred_client_id} onValueChange={(v) => setReferralForm({ ...referralForm, referred_client_id: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{clients.filter(c => c.id !== referralForm.referrer_client_id).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Código</Label><div className="flex gap-2"><Input value={referralForm.referral_code} readOnly /><Button variant="outline" size="icon" onClick={() => copyCode(referralForm.referral_code)} disabled={!referralForm.referral_code}><Copy className="h-4 w-4" /></Button></div></div>
                  <div><Label>Valor (R$)</Label><Input type="number" min="0" step="0.01" value={referralForm.reward_amount} onChange={(e) => setReferralForm({ ...referralForm, reward_amount: parseFloat(e.target.value) || 0 })} /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setReferralDialogOpen(false)}>Cancelar</Button><Button onClick={handleCreateReferral} disabled={isAdding || !referralForm.referrer_client_id || !referralForm.referred_client_id}>{isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<UserPlus className="h-4 w-4 mr-2" />Registrar</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Loyalty;
