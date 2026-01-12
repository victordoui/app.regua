import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Plus, 
  Gift, 
  Users, 
  CheckCircle, 
  Clock,
  Loader2,
  Copy,
  TrendingUp
} from 'lucide-react';
import { useReferrals, ReferralFormData } from '@/hooks/useReferrals';
import { useClients } from '@/hooks/useClients';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const Referrals = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState<ReferralFormData>({
    referrer_client_id: '',
    referred_client_id: '',
    referral_code: '',
    reward_amount: 20
  });

  const { 
    referrals, 
    isLoading, 
    addReferral, 
    markRewardGiven, 
    generateReferralCode,
    isAdding,
    isMarking
  } = useReferrals();

  const { clients, isLoading: isLoadingClients } = useClients();
  const { toast } = useToast();

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => !r.reward_given).length,
    rewarded: referrals.filter(r => r.reward_given).length,
    totalRewards: referrals.filter(r => r.reward_given).reduce((sum, r) => sum + (r.reward_amount || 0), 0)
  };

  const filteredReferrals = activeTab === 'all' 
    ? referrals 
    : activeTab === 'pending' 
      ? referrals.filter(r => !r.reward_given)
      : referrals.filter(r => r.reward_given);

  const handleReferrerSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    const code = client ? generateReferralCode(client.name) : '';
    setFormData({ 
      ...formData, 
      referrer_client_id: clientId,
      referral_code: code
    });
  };

  const handleSubmit = async () => {
    if (!formData.referrer_client_id || !formData.referred_client_id) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione quem indicou e quem foi indicado.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.referrer_client_id === formData.referred_client_id) {
      toast({
        title: 'Clientes iguais',
        description: 'O cliente que indicou e o indicado devem ser diferentes.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addReferral(formData);
      setIsDialogOpen(false);
      setFormData({
        referrer_client_id: '',
        referred_client_id: '',
        referral_code: '',
        reward_amount: 20
      });
    } catch (error) {
      console.error('Error adding referral:', error);
    }
  };

  const handleMarkReward = async (referralId: string) => {
    try {
      await markRewardGiven(referralId);
    } catch (error) {
      console.error('Error marking reward:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Código copiado!',
      description: code
    });
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Indicações</h1>
            <p className="text-muted-foreground">
              Gerencie o programa de indicações e recompensas.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Indicação
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Indicações</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rewarded}</p>
                <p className="text-sm text-muted-foreground">Recompensados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Gift className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {stats.totalRewards.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total em Recompensas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="rewarded">Recompensadas</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma indicação encontrada.</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeira Indicação
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quem Indicou</TableHead>
                    <TableHead>Cliente Indicado</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Recompensa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">
                        {referral.referrer?.name || 'Cliente não encontrado'}
                      </TableCell>
                      <TableCell>
                        {referral.referred?.name || 'Cliente não encontrado'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-muted rounded text-sm">
                            {referral.referral_code}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyCode(referral.referral_code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {referral.reward_amount 
                          ? `R$ ${referral.reward_amount.toFixed(2)}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {referral.reward_given ? (
                          <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Recompensado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(referral.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        {!referral.reward_given && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkReward(referral.id)}
                            disabled={isMarking}
                          >
                            {isMarking ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Gift className="h-4 w-4 mr-2" />
                                Marcar Entregue
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Referral Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Indicação</DialogTitle>
              <DialogDescription>
                Registre uma indicação feita por um cliente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Quem Indicou</Label>
                <Select
                  value={formData.referrer_client_id}
                  onValueChange={handleReferrerSelect}
                  disabled={isLoadingClients}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente que indicou" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cliente Indicado</Label>
                <Select
                  value={formData.referred_client_id}
                  onValueChange={(value) => setFormData({ ...formData, referred_client_id: value })}
                  disabled={isLoadingClients}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente indicado" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients
                      .filter(c => c.id !== formData.referrer_client_id)
                      .map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Código de Indicação</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.referral_code}
                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                    placeholder="Código gerado automaticamente"
                    readOnly
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyCode(formData.referral_code)}
                    disabled={!formData.referral_code}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor da Recompensa (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.reward_amount}
                  onChange={(e) => setFormData({ ...formData, reward_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="20.00"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isAdding || !formData.referrer_client_id || !formData.referred_client_id}
              >
                {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <UserPlus className="h-4 w-4 mr-2" />
                Registrar Indicação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Referrals;
