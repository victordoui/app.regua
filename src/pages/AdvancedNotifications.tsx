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
import { Bell, Send, MessageSquare, Mail, Phone, Calendar, Clock, Users, Settings, Plus, Filter, Search, Zap, Target, BarChart3, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { StatusCards } from '@/components/ui/status-cards';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'whatsapp' | 'push';
  trigger: 'appointment_reminder' | 'appointment_confirmation' | 'birthday' | 'promotion' | 'feedback_request' | 'custom';
  subject?: string;
  message: string;
  timing: number;
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

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Mock data loading
      setTemplates([
        { id: '1', name: 'Lembrete de Agendamento', type: 'sms', trigger: 'appointment_reminder', message: 'Olá {nome}! Agendamento amanhã às {hora}.', timing: 24, active: true, created_at: '2024-12-01' },
        { id: '2', name: 'Confirmação', type: 'email', trigger: 'appointment_confirmation', subject: 'Confirmado - VIZZU', message: 'Confirmado para {data} às {hora}.', timing: 0, active: true, created_at: '2024-12-01' },
        { id: '3', name: 'Aniversário', type: 'whatsapp', trigger: 'birthday', message: 'Parabéns, {nome}! 🎉 20% de desconto!', timing: 0, active: true, created_at: '2024-12-01' }
      ]);
      setCampaigns([
        { id: '1', name: 'Promoção de Natal', description: 'Campanha natalina', type: 'promotional', target_audience: 'all', channels: ['sms', 'email', 'whatsapp'], message: 'Natal! 🎄 30% off!', scheduled_date: '2024-12-20', status: 'scheduled', recipients_count: 450, created_at: '2024-12-15' },
        { id: '2', name: 'Feedback Pós-Atendimento', description: 'Solicitação de feedback', type: 'informational', target_audience: 'all', channels: ['email'], message: 'Como foi sua experiência?', status: 'sent', recipients_count: 120, open_rate: 65, click_rate: 23, created_at: '2024-12-10' }
      ]);
      setHistory([
        { id: '1', client_name: 'João Silva', type: 'sms', message: 'Lembrete: amanhã às 14h', status: 'delivered', sent_at: '2024-12-20 10:00' },
        { id: '2', client_name: 'Maria Santos', type: 'email', subject: 'Confirmado', message: 'Confirmado para hoje às 16h', status: 'read', sent_at: '2024-12-20 09:30' },
      ]);
    } finally { setLoading(false); }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.message) { toast.error('Preencha todos os campos'); return; }
    setTemplates(prev => [{ id: Date.now().toString(), name: newTemplate.name!, type: newTemplate.type!, trigger: newTemplate.trigger!, subject: newTemplate.subject, message: newTemplate.message!, timing: newTemplate.timing!, active: newTemplate.active!, created_at: new Date().toISOString().split('T')[0] }, ...prev]);
    setNewTemplate({ name: '', type: 'sms', trigger: 'appointment_reminder', subject: '', message: '', timing: 24, active: true });
    setIsTemplateDialogOpen(false);
    toast.success('Template criado!');
  };

  const handleSaveCampaign = async () => {
    if (!newCampaign.name || !newCampaign.message) { toast.error('Preencha todos os campos'); return; }
    setCampaigns(prev => [{ id: Date.now().toString(), name: newCampaign.name!, description: newCampaign.description!, type: newCampaign.type!, target_audience: newCampaign.target_audience!, channels: newCampaign.channels!, message: newCampaign.message!, scheduled_date: newCampaign.scheduled_date, status: newCampaign.status!, recipients_count: 0, created_at: new Date().toISOString().split('T')[0] }, ...prev]);
    setNewCampaign({ name: '', description: '', type: 'promotional', target_audience: 'all', channels: ['sms'], message: '', scheduled_date: '', status: 'draft' });
    setIsCampaignDialogOpen(false);
    toast.success('Campanha criada!');
  };

  const toggleTemplate = (id: string) => { setTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t)); toast.success('Atualizado!'); };

  const getStatusColor = (status: string) => {
    const m: Record<string, string> = { sent: 'bg-green-500/10 text-green-600', delivered: 'bg-blue-500/10 text-blue-600', read: 'bg-purple-500/10 text-purple-600', failed: 'bg-red-500/10 text-red-600', scheduled: 'bg-amber-500/10 text-amber-600', draft: 'bg-muted text-muted-foreground' };
    return m[status] || 'bg-muted text-muted-foreground';
  };

  const getTypeIcon = (type: string) => {
    const m: Record<string, React.ReactNode> = { sms: <MessageSquare className="w-4 h-4" />, email: <Mail className="w-4 h-4" />, whatsapp: <Phone className="w-4 h-4" />, push: <Bell className="w-4 h-4" /> };
    return m[type] || <MessageSquare className="w-4 h-4" />;
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div></Layout>;

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <PageHeader icon={<Bell className="h-5 w-5" />} title="Notificações Avançadas" subtitle="Templates, campanhas e comunicação">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="w-4 h-4 mr-2" />Novo Template</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Template</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input value={newTemplate.name || ''} onChange={(e) => setNewTemplate(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Tipo</Label><Select value={newTemplate.type} onValueChange={(v: any) => setNewTemplate(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sms">SMS</SelectItem><SelectItem value="email">Email</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="push">Push</SelectItem></SelectContent></Select></div>
                <div><Label>Mensagem</Label><Textarea value={newTemplate.message || ''} onChange={(e) => setNewTemplate(p => ({ ...p, message: e.target.value }))} rows={4} /></div>
                <Button onClick={handleSaveTemplate} className="w-full">Criar Template</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
            <DialogTrigger asChild><Button><Zap className="w-4 h-4 mr-2" />Nova Campanha</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Campanha</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input value={newCampaign.name || ''} onChange={(e) => setNewCampaign(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Mensagem</Label><Textarea value={newCampaign.message || ''} onChange={(e) => setNewCampaign(p => ({ ...p, message: e.target.value }))} rows={4} /></div>
                <Button onClick={handleSaveCampaign} className="w-full">Criar Campanha</Button>
              </div>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <StatusCards
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          items={[
            { label: "Mensagens Enviadas", value: "1,234", icon: <Send className="h-5 w-5" />, color: "blue" },
            { label: "Taxa de Entrega", value: "98.5%", icon: <Target className="h-5 w-5" />, color: "green" },
            { label: "Taxa de Abertura", value: "67.3%", icon: <BarChart3 className="h-5 w-5" />, color: "purple" },
            { label: "Campanhas Ativas", value: "3", icon: <Zap className="h-5 w-5" />, color: "amber" },
          ]}
        />

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="p-5 border-b border-border/40 flex justify-between items-center">
                <div><h3 className="font-semibold">Templates de Notificação</h3><p className="text-sm text-muted-foreground">Gerencie templates automáticos</p></div>
                <div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-64" /></div>
              </div>
              <div className="p-5 space-y-3">
                {templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">{getTypeIcon(t.type)}</div>
                      <div><h4 className="font-medium">{t.name}</h4><p className="text-sm text-muted-foreground truncate max-w-md">{t.message}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{t.type.toUpperCase()}</Badge>
                      <Switch checked={t.active} onCheckedChange={() => toggleTemplate(t.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map(c => (
                <div key={c.id} className="rounded-xl border border-border/40 bg-card p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3"><h4 className="font-semibold">{c.name}</h4><Badge className={getStatusColor(c.status)}>{c.status}</Badge></div>
                  <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                  <div className="flex gap-2 flex-wrap mb-3">{c.channels.map(ch => <Badge key={ch} variant="outline" className="text-xs">{ch.toUpperCase()}</Badge>)}</div>
                  <div className="flex justify-between text-sm text-muted-foreground border-t border-border/40 pt-3"><span>{c.recipients_count} destinatários</span>{c.open_rate && <span>{c.open_rate}% abertura</span>}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Histórico de Envios</h3></div>
              <div className="p-5 space-y-3">
                {history.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">{getTypeIcon(h.type)}</div>
                      <div><h4 className="font-medium">{h.client_name}</h4><p className="text-sm text-muted-foreground truncate max-w-md">{h.message}</p></div>
                    </div>
                    <div className="flex items-center gap-3"><Badge className={getStatusColor(h.status)}>{h.status}</Badge><span className="text-xs text-muted-foreground">{h.sent_at}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Canais de Notificação</h3></div>
              <div className="p-5 space-y-4">
                {[{ label: 'SMS', key: 'sms_enabled' }, { label: 'Email', key: 'email_enabled' }, { label: 'WhatsApp', key: 'whatsapp_enabled' }, { label: 'Push', key: 'push_enabled' }].map(ch => (
                  <div key={ch.key} className="flex items-center justify-between"><Label>{ch.label}</Label><Switch checked={(settings as any)[ch.key]} onCheckedChange={(v) => setSettings(p => ({ ...p, [ch.key]: v }))} /></div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border/40 bg-card shadow-sm">
              <div className="p-5 border-b border-border/40"><h3 className="font-semibold">Automações</h3></div>
              <div className="p-5 space-y-4">
                {[{ label: 'Lembretes de Agendamento', key: 'appointment_reminders' }, { label: 'Mensagens de Aniversário', key: 'birthday_messages' }, { label: 'Promoções', key: 'promotional_messages' }, { label: 'Feedback', key: 'feedback_requests' }].map(a => (
                  <div key={a.key} className="flex items-center justify-between"><Label>{a.label}</Label><Switch checked={(settings as any)[a.key]} onCheckedChange={(v) => setSettings(p => ({ ...p, [a.key]: v }))} /></div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default AdvancedNotifications;
