import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Crown, Gift, Plus, Star, Users, Trash2, Loader2 } from 'lucide-react';

const Loyalty = () => {
  const { loyaltyPoints, rewards, stats, isLoading, createReward, deleteReward, isCreatingReward } = useLoyalty();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', points_required: '', reward_type: 'discount' as const, reward_value: '' });

  const handleSubmit = async () => {
    if (!formData.name || !formData.points_required) return;
    await createReward({
      name: formData.name,
      points_required: Number(formData.points_required),
      reward_type: formData.reward_type,
      reward_value: formData.reward_value ? Number(formData.reward_value) : undefined
    });
    setDialogOpen(false);
    setFormData({ name: '', points_required: '', reward_type: 'discount', reward_value: '' });
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold tracking-tight">Fidelidade</h1><p className="text-muted-foreground">Programa de pontos e recompensas</p></div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Recompensa</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Recompensa</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Corte Grátis" /></div>
                <div><Label>Pontos Necessários</Label><Input type="number" value={formData.points_required} onChange={e => setFormData(p => ({ ...p, points_required: e.target.value }))} /></div>
                <div><Label>Tipo</Label><Select value={formData.reward_type} onValueChange={(v: any) => setFormData(p => ({ ...p, reward_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="discount">Desconto</SelectItem><SelectItem value="service">Serviço Grátis</SelectItem><SelectItem value="product">Produto</SelectItem></SelectContent></Select></div>
                {formData.reward_type === 'discount' && <div><Label>Valor do Desconto (R$)</Label><Input type="number" value={formData.reward_value} onChange={e => setFormData(p => ({ ...p, reward_value: e.target.value }))} /></div>}
                <Button onClick={handleSubmit} disabled={isCreatingReward} className="w-full">{isCreatingReward && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">Clientes</span></div><p className="text-3xl font-bold mt-2">{stats.totalClients}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /><span className="text-sm text-muted-foreground">Pontos Distribuídos</span></div><p className="text-3xl font-bold mt-2">{stats.totalPointsDistributed}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Gift className="h-5 w-5 text-green-500" /><span className="text-sm text-muted-foreground">Pontos Resgatados</span></div><p className="text-3xl font-bold mt-2">{stats.totalPointsRedeemed}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-2"><Crown className="h-5 w-5 text-purple-500" /><span className="text-sm text-muted-foreground">Recompensas Ativas</span></div><p className="text-3xl font-bold mt-2">{stats.activeRewards}</p></CardContent></Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Recompensas Disponíveis</CardTitle></CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><Gift className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma recompensa cadastrada</p></div>
              ) : (
                <div className="space-y-3">
                  {rewards.map(reward => (
                    <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{reward.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{reward.points_required} pts</Badge>
                          <Badge variant="outline">{reward.reward_type === 'discount' ? 'Desconto' : reward.reward_type === 'service' ? 'Serviço' : 'Produto'}</Badge>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteReward(reward.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ranking de Clientes</CardTitle></CardHeader>
            <CardContent>
              {loyaltyPoints.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><Crown className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum cliente com pontos</p></div>
              ) : (
                <div className="space-y-3">
                  {loyaltyPoints.slice(0, 10).map((lp, index) => (
                    <div key={lp.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>{index + 1}</div>
                        <div><p className="font-medium">{lp.client?.name || 'Cliente'}</p><p className="text-xs text-muted-foreground">{lp.client?.phone}</p></div>
                      </div>
                      <Badge>{lp.points} pts</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Loyalty;
