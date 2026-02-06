import { useState } from 'react';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlatformBroadcast } from '@/hooks/superadmin/usePlatformBroadcast';
import { Send, Plus, Trash2, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BroadcastFormData, PlanType, SubscriptionStatus } from '@/types/superAdmin';

const channelIcons = {
  email: Mail,
  push: MessageSquare,
  sms: Smartphone,
};

const channelLabels = {
  email: 'Email',
  push: 'Push Notification',
  sms: 'SMS',
};

const planOptions: PlanType[] = ['trial', 'basic', 'pro', 'enterprise'];
const statusOptions: SubscriptionStatus[] = ['active', 'suspended', 'cancelled', 'expired'];

const BroadcastMessages = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BroadcastFormData>({
    title: '',
    content: '',
    channel: 'email',
    target_plans: null,
    target_status: null,
  });
  const [selectedPlans, setSelectedPlans] = useState<PlanType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<SubscriptionStatus[]>(['active']);

  const {
    broadcasts,
    isLoading,
    createBroadcast,
    sendBroadcast,
    deleteBroadcast,
    isCreating,
    isSending,
  } = usePlatformBroadcast();

  const handleSubmit = () => {
    createBroadcast({
      ...formData,
      target_plans: selectedPlans.length > 0 ? selectedPlans : null,
      target_status: selectedStatuses.length > 0 ? selectedStatuses : null,
    });
    setIsDialogOpen(false);
    setFormData({ title: '', content: '', channel: 'email', target_plans: null, target_status: null });
    setSelectedPlans([]);
    setSelectedStatuses(['active']);
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mensagens em Massa</h1>
            <p className="text-muted-foreground">
              Envie comunicações para assinantes da plataforma
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Mensagem em Massa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      placeholder="Título da mensagem"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Canal</label>
                    <Select
                      value={formData.channel}
                      onValueChange={(value: 'email' | 'push' | 'sms') =>
                        setFormData({ ...formData, channel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conteúdo</label>
                  <Textarea
                    placeholder="Escreva a mensagem..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Planos Alvo</label>
                    <div className="space-y-2">
                      {planOptions.map((plan) => (
                        <div key={plan} className="flex items-center space-x-2">
                          <Checkbox
                            id={`plan-${plan}`}
                            checked={selectedPlans.includes(plan)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPlans([...selectedPlans, plan]);
                              } else {
                                setSelectedPlans(selectedPlans.filter((p) => p !== plan));
                              }
                            }}
                          />
                          <label htmlFor={`plan-${plan}`} className="text-sm capitalize">
                            {plan}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deixe vazio para todos os planos
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status Alvo</label>
                    <div className="space-y-2">
                      {statusOptions.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStatuses([...selectedStatuses, status]);
                              } else {
                                setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
                              }
                            }}
                          />
                          <label htmlFor={`status-${status}`} className="text-sm capitalize">
                            {status === 'active' ? 'Ativo' : status === 'suspended' ? 'Suspenso' : status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} disabled={isCreating || !formData.title || !formData.content}>
                    Criar Mensagem
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages List */}
        <div className="grid gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : broadcasts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Send className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma mensagem criada</p>
              </CardContent>
            </Card>
          ) : (
            broadcasts.map((broadcast) => {
              const ChannelIcon = channelIcons[broadcast.channel];
              return (
                <Card key={broadcast.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <ChannelIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{broadcast.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {channelLabels[broadcast.channel]} • Criado em{' '}
                            {format(new Date(broadcast.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {broadcast.sent_at ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            Enviado ({broadcast.sent_count})
                          </Badge>
                        ) : (
                          <Badge variant="outline">Rascunho</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{broadcast.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {broadcast.target_plans && broadcast.target_plans.length > 0 && (
                          <div className="flex gap-1">
                            {broadcast.target_plans.map((plan) => (
                              <Badge key={plan} variant="outline" className="text-xs capitalize">
                                {plan}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!broadcast.sent_at && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => sendBroadcast(broadcast.id)}
                              disabled={isSending}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Agora
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteBroadcast(broadcast.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default BroadcastMessages;
