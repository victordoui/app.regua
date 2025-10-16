import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, 
  Send, 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Plus,
  Filter,
  Search,
  Zap,
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'whatsapp' | 'push';
  trigger: 'appointment_reminder' | 'appointment_confirmation' | 'birthday' | 'promotion' | 'feedback_request' | 'custom';
  subject?: string;
  message: string;
  timing: number; // em horas antes do evento
  active: boolean;
  created_at: string;
}

interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  type: 'promotional' | 'informational' | 'reminder';
  target_audience: 'all' | 'subscribers' | 'vip' | 'inactive';
  channels: ('sms' | 'email' | 'whatsapp' | 'push')[];
  message: string;
  scheduled_date?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  recipients_count: number;
  open_rate?: number;
  click_rate?: number;
  created_at: string;
}

interface NotificationHistory {
  id: string;
  client_name: string;
  type: 'sms' | 'email' | 'whatsapp' | 'push';
  subject?: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  campaign_id?: string;
}

interface NotificationSettings {
  sms_enabled: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  push_enabled: boolean;
  appointment_reminders: boolean;
  birthday_messages: boolean;
  promotional_messages: boolean;
  feedback_requests: boolean;
  reminder_timing: number;
}

function AdvancedNotifications() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    sms_enabled: true,
    email_enabled: true,
    whatsapp_enabled: true,
    push_enabled: true,
    appointment_reminders: true,
    birthday_messages: true,
    promotional_messages: true,
    feedback_requests: true,
    reminder_timing: 24
  });
  const [selectedTab, setSelectedTab] = useState('templates');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const [newTemplate, setNewTemplate] = useState<Partial<NotificationTemplate>>({
    name: '',
    type: 'sms',
    trigger: 'appointment_reminder',
    subject: '',
    message: '',
    timing: 24,
    active: true
  });

  const [newCampaign, setNewCampaign] = useState<Partial<NotificationCampaign>>({
    name: '',
    description: '',
    type: 'promotional',
    target_audience: 'all',
    channels: ['sms'],
    message: '',
    scheduled_date: '',
    status: 'draft'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTemplates(),
        loadCampaigns(),
        loadHistory()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do sistema');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    // Simulação de dados - em produção, viria do Supabase
    const mockTemplates: NotificationTemplate[] = [
      {
        id: '1',
        name: 'Lembrete de Agendamento',
        type: 'sms',
        trigger: 'appointment_reminder',
        message: 'Olá {nome}! Lembramos que você tem um agendamento amanhã às {hora} com {barbeiro}. Confirme sua presença.',
        timing: 24,
        active: true,
        created_at: '2024-12-01'
      },
      {
        id: '2',
        name: 'Confirmação de Agendamento',
        type: 'email',
        trigger: 'appointment_confirmation',
        subject: 'Agendamento Confirmado - Na Régua',
        message: 'Seu agendamento foi confirmado para {data} às {hora}. Aguardamos você!',
        timing: 0,
        active: true,
        created_at: '2024-12-01'
      },
      {
        id: '3',
        name: 'Parabéns de Aniversário',
        type: 'whatsapp',
        trigger: 'birthday',
        message: 'Parabéns, {nome}! 🎉 Que tal comemorar com um corte especial? Temos 20% de desconto para você hoje!',
        timing: 0,
        active: true,
        created_at: '2024-12-01'
      }
    ];
    setTemplates(mockTemplates);
  };

  const loadCampaigns = async () => {
    // Simulação de dados - em produção, viria do Supabase
    const mockCampaigns: NotificationCampaign[] = [
      {
        id: '1',
        name: 'Promoção de Natal',
        description: 'Campanha promocional para o período natalino',
        type: 'promotional',
        target_audience: 'all',
        channels: ['sms', 'email', 'whatsapp'],
        message: 'Natal chegando! 🎄 Aproveite 30% de desconto em todos os serviços até 31/12. Agende já!',
        scheduled_date: '2024-12-20',
        status: 'scheduled',
        recipients_count: 450,
        created_at: '2024-12-15'
      },
      {
        id: '2',
        name: 'Feedback Pós-Atendimento',
        description: 'Solicitação de feedback após serviços',
        type: 'informational',
        target_audience: 'all',
        channels: ['email'],
        message: 'Como foi sua experiência conosco? Sua opinião é muito importante!',
        status: 'sent',
        recipients_count: 120,
        open_rate: 65,
        click_rate: 23,
        created_at: '2024-12-10'
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const loadHistory = async () => {
    // Simulação de dados - em produção, viria do Supabase
    const mockHistory: NotificationHistory[] = [
      {
        id: '1',
        client_name: 'João Silva',
        type: 'sms',
        message: 'Lembrete: agendamento amanhã às 14h com Carlos',
        status: 'delivered',
        sent_at: '2024-12-20 10:00',
        campaign_id: '1'
      },
      {
        id: '2',
        client_name: 'Maria Santos',
        type: 'email',
        subject: 'Agendamento Confirmado',
        message: 'Seu agendamento foi confirmado para hoje às 16h',
        status: 'read',
        sent_at: '2024-12-20 09:30'
      },
      {
        id: '3',
        client_name: 'Pedro Costa',
        type: 'whatsapp',
        message: 'Parabéns! Aproveite 20% de desconto no seu aniversário',
        status: 'delivered',
        sent_at: '2024-12-20 08:00'
      }
    ];
    setHistory(mockHistory);
  };

  const handleSaveTemplate = async () => {
    try {
      if (!newTemplate.name || !newTemplate.message) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const template: NotificationTemplate = {
        id: Date.now().toString(),
        name: newTemplate.name!,
        type: newTemplate.type!,
        trigger: newTemplate.trigger!,
        subject: newTemplate.subject,
        message: newTemplate.message!,
        timing: newTemplate.timing!,
        active: newTemplate.active!,
        created_at: new Date().toISOString().split('T')[0]
      };

      setTemplates(prev => [template, ...prev]);
      setNewTemplate({
        name: '',
        type: 'sms',
        trigger: 'appointment_reminder',
        subject: '',
        message: '',
        timing: 24,
        active: true
      });
      setIsTemplateDialogOpen(false);
      toast.success('Template criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao criar template');
    }
  };

  const handleSaveCampaign = async () => {
    try {
      if (!newCampaign.name || !newCampaign.message) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const campaign: NotificationCampaign = {
        id: Date.now().toString(),
        name: newCampaign.name!,
        description: newCampaign.description!,
        type: newCampaign.type!,
        target_audience: newCampaign.target_audience!,
        channels: newCampaign.channels!,
        message: newCampaign.message!,
        scheduled_date: newCampaign.scheduled_date,
        status: newCampaign.status!,
        recipients_count: 0,
        created_at: new Date().toISOString().split('T')[0]
      };

      setCampaigns(prev => [campaign, ...prev]);
      setNewCampaign({
        name: '',
        description: '',
        type: 'promotional',
        target_audience: 'all',
        channels: ['sms'],
        message: '',
        scheduled_date: '',
        status: 'draft'
      });
      setIsCampaignDialogOpen(false);
      toast.success('Campanha criada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar campanha:', error);
      toast.error('Erro ao criar campanha');
    }
  };

  const toggleTemplate = async (templateId: string) => {
    try {
      setTemplates(prev => 
        prev.map(t => t.id === templateId ? { ...t, active: !t.active } : t)
      );
      toast.success('Template atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar template:', error);
      toast.error('Erro ao atualizar template');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <Phone className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notificações Avançadas</h1>
            <p className="text-muted-foreground">
              Gerencie templates, campanhas e comunicação com clientes
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Zap className="w-4 h-4 mr-2" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Métricas de Notificações */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +15% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">
                +2% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">67.3%</div>
              <p className="text-xs text-muted-foreground">
                +8% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                2 agendadas para esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Templates de Notificação</CardTitle>
                    <CardDescription>
                      Gerencie templates automáticos para diferentes tipos de notificação
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.map(template => (
                    <div key={template.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(template.type)}
                            <h4 className="font-semibold">{template.name}</h4>
                            <Badge variant="secondary">{template.trigger}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Enviado {template.timing}h antes do evento
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={template.active}
                            onCheckedChange={() => toggleTemplate(template.id)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {template.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {template.message}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas de Marketing</CardTitle>
                <CardDescription>
                  Crie e gerencie campanhas de comunicação em massa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">{campaign.description}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className={getStatusColor(campaign.status)}>
                              {getStatusIcon(campaign.status)}
                              <span className="ml-1">{campaign.status}</span>
                            </Badge>
                            <span>•</span>
                            <span>{campaign.recipients_count} destinatários</span>
                            {campaign.open_rate && (
                              <>
                                <span>•</span>
                                <span>{campaign.open_rate}% abertura</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {campaign.channels.map(channel => (
                            <Badge key={channel} variant="outline">
                              {getTypeIcon(channel)}
                              <span className="ml-1">{channel}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {campaign.message}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Histórico de Notificações</CardTitle>
                    <CardDescription>
                      Acompanhe todas as notificações enviadas
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.map(item => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="font-semibold">{item.client_name}</span>
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{item.status}</span>
                            </Badge>
                          </div>
                          {item.subject && (
                            <p className="text-sm font-medium">{item.subject}</p>
                          )}
                          <p className="text-sm text-muted-foreground">{item.sent_at}</p>
                        </div>
                      </div>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificação</CardTitle>
                <CardDescription>
                  Configure as preferências do sistema de notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Canais de Comunicação</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>SMS</span>
                      </div>
                      <Switch
                        checked={settings.sms_enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, sms_enabled: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </div>
                      <Switch
                        checked={settings.email_enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, email_enabled: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </div>
                      <Switch
                        checked={settings.whatsapp_enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, whatsapp_enabled: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <span>Push Notifications</span>
                      </div>
                      <Switch
                        checked={settings.push_enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, push_enabled: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Tipos de Notificação</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Lembretes de Agendamento</span>
                      <Switch
                        checked={settings.appointment_reminders}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, appointment_reminders: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mensagens de Aniversário</span>
                      <Switch
                        checked={settings.birthday_messages}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, birthday_messages: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mensagens Promocionais</span>
                      <Switch
                        checked={settings.promotional_messages}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, promotional_messages: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Solicitações de Feedback</span>
                      <Switch
                        checked={settings.feedback_requests}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, feedback_requests: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Configurações de Timing</h4>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-timing">Enviar lembretes (horas antes)</Label>
                    <Select 
                      value={settings.reminder_timing.toString()} 
                      onValueChange={(value) => 
                        setSettings(prev => ({ ...prev, reminder_timing: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hora</SelectItem>
                        <SelectItem value="2">2 horas</SelectItem>
                        <SelectItem value="4">4 horas</SelectItem>
                        <SelectItem value="12">12 horas</SelectItem>
                        <SelectItem value="24">24 horas</SelectItem>
                        <SelectItem value="48">48 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={() => toast.success('Configurações salvas com sucesso!')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
              <DialogDescription>
                Configure um template de notificação automática
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Lembrete de Agendamento"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="template-type">Tipo</Label>
                  <Select value={newTemplate.type} onValueChange={(value: any) => 
                    setNewTemplate(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-trigger">Gatilho</Label>
                  <Select value={newTemplate.trigger} onValueChange={(value: any) => 
                    setNewTemplate(prev => ({ ...prev, trigger: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment_reminder">Lembrete de Agendamento</SelectItem>
                      <SelectItem value="appointment_confirmation">Confirmação de Agendamento</SelectItem>
                      <SelectItem value="birthday">Aniversário</SelectItem>
                      <SelectItem value="promotion">Promoção</SelectItem>
                      <SelectItem value="feedback_request">Solicitação de Feedback</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newTemplate.type === 'email' && (
                <div className="grid gap-2">
                  <Label htmlFor="template-subject">Assunto</Label>
                  <Input
                    id="template-subject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Assunto do email"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="template-message">Mensagem</Label>
                <Textarea
                  id="template-message"
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Use {nome}, {data}, {hora}, {barbeiro} para personalizar"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="template-timing">Enviar (horas antes)</Label>
                <Select value={newTemplate.timing?.toString()} onValueChange={(value) => 
                  setNewTemplate(prev => ({ ...prev, timing: parseInt(value) }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No momento</SelectItem>
                    <SelectItem value="1">1 hora antes</SelectItem>
                    <SelectItem value="2">2 horas antes</SelectItem>
                    <SelectItem value="4">4 horas antes</SelectItem>
                    <SelectItem value="12">12 horas antes</SelectItem>
                    <SelectItem value="24">24 horas antes</SelectItem>
                    <SelectItem value="48">48 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Send className="w-4 h-4 mr-2" />
                Criar Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
              <DialogDescription>
                Configure uma campanha de comunicação em massa
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="campaign-name">Nome da Campanha</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Promoção de Natal"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaign-description">Descrição</Label>
                <Input
                  id="campaign-description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descrição da campanha"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="campaign-type">Tipo</Label>
                  <Select value={newCampaign.type} onValueChange={(value: any) => 
                    setNewCampaign(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">Promocional</SelectItem>
                      <SelectItem value="informational">Informativa</SelectItem>
                      <SelectItem value="reminder">Lembrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="campaign-audience">Público-Alvo</Label>
                  <Select value={newCampaign.target_audience} onValueChange={(value: any) => 
                    setNewCampaign(prev => ({ ...prev, target_audience: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Clientes</SelectItem>
                      <SelectItem value="subscribers">Assinantes</SelectItem>
                      <SelectItem value="vip">Clientes VIP</SelectItem>
                      <SelectItem value="inactive">Clientes Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Canais de Comunicação</Label>
                <div className="flex gap-4">
                  {['sms', 'email', 'whatsapp', 'push'].map(channel => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={channel}
                        checked={newCampaign.channels?.includes(channel as any)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewCampaign(prev => ({
                              ...prev,
                              channels: [...(prev.channels || []), channel as any]
                            }));
                          } else {
                            setNewCampaign(prev => ({
                              ...prev,
                              channels: prev.channels?.filter(c => c !== channel)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={channel} className="capitalize">{channel}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaign-message">Mensagem</Label>
                <Textarea
                  id="campaign-message"
                  value={newCampaign.message}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Conteúdo da mensagem da campanha"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campaign-date">Data de Envio (opcional)</Label>
                <Input
                  id="campaign-date"
                  type="datetime-local"
                  value={newCampaign.scheduled_date}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCampaignDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCampaign}>
                <Zap className="w-4 h-4 mr-2" />
                Criar Campanha
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default AdvancedNotifications;