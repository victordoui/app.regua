import React, { useState, useEffect } from 'react';
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
import { Bell, Send, MessageSquare, Mail, Phone, Calendar, Clock, Users, Settings, Plus, Search, Zap, Target, BarChart3, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface NotificationTemplate { id: string; name: string; type: 'sms' | 'email' | 'whatsapp' | 'push'; trigger: string; subject?: string; message: string; timing: number; active: boolean; created_at: string; }
interface NotificationCampaign { id: string; name: string; description: string; type: string; target_audience: string; channels: string[]; message: string; scheduled_date?: string; status: string; recipients_count: number; open_rate?: number; click_rate?: number; created_at: string; }
interface NotificationHistory { id: string; client_name: string; type: string; subject?: string; message: string; status: string; sent_at: string; }

function NotificationsContent() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [selectedTab, setSelectedTab] = useState('templates');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setTemplates([
      { id: '1', name: 'Lembrete de Agendamento', type: 'sms', trigger: 'appointment_reminder', message: 'Olá {nome}! Lembramos que você tem um agendamento amanhã às {hora}.', timing: 24, active: true, created_at: '2024-12-01' },
      { id: '2', name: 'Confirmação de Agendamento', type: 'email', trigger: 'appointment_confirmation', subject: 'Agendamento Confirmado', message: 'Seu agendamento foi confirmado para {data} às {hora}.', timing: 0, active: true, created_at: '2024-12-01' },
      { id: '3', name: 'Parabéns de Aniversário', type: 'whatsapp', trigger: 'birthday', message: 'Parabéns, {nome}! 🎉 Temos 20% de desconto para você hoje!', timing: 0, active: true, created_at: '2024-12-01' }
    ]);
    setCampaigns([
      { id: '1', name: 'Promoção de Natal', description: 'Campanha natalina', type: 'promotional', target_audience: 'all', channels: ['sms', 'email'], message: 'Natal chegando! 🎄 30% de desconto!', scheduled_date: '2024-12-20', status: 'scheduled', recipients_count: 450, created_at: '2024-12-15' },
      { id: '2', name: 'Feedback Pós-Atendimento', description: 'Feedback', type: 'informational', target_audience: 'all', channels: ['email'], message: 'Como foi sua experiência?', status: 'sent', recipients_count: 120, open_rate: 65, click_rate: 23, created_at: '2024-12-10' }
    ]);
    setHistory([
      { id: '1', client_name: 'João Silva', type: 'sms', message: 'Lembrete: agendamento amanhã às 14h', status: 'delivered', sent_at: '2024-12-20 10:00' },
      { id: '2', client_name: 'Maria Santos', type: 'email', subject: 'Agendamento Confirmado', message: 'Seu agendamento foi confirmado', status: 'read', sent_at: '2024-12-20 09:30' }
    ]);
    setLoading(false);
  };

  const toggleTemplate = (id: string) => { setTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t)); toast.success('Template atualizado!'); };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { sent: 'bg-green-100 text-green-800', delivered: 'bg-blue-100 text-blue-800', read: 'bg-purple-100 text-purple-800', failed: 'bg-red-100 text-red-800', scheduled: 'bg-yellow-100 text-yellow-800', draft: 'bg-gray-100 text-gray-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = { sms: <MessageSquare className="w-4 h-4" />, email: <Mail className="w-4 h-4" />, whatsapp: <Phone className="w-4 h-4" />, push: <Bell className="w-4 h-4" /> };
    return icons[type] || <MessageSquare className="w-4 h-4" />;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-lg">Carregando...</div></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle><Send className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">1,234</div><p className="text-xs text-muted-foreground">+15% em relação ao mês anterior</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle><Target className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">98.5%</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">67.3%</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle><Zap className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">3</div></CardContent></Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">{getTypeIcon(template.type)}</div>
                    <div><p className="font-medium">{template.name}</p><p className="text-sm text-muted-foreground truncate max-w-md">{template.message}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{template.type.toUpperCase()}</Badge>
                    <Switch checked={template.active} onCheckedChange={() => toggleTemplate(template.id)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {campaigns.map(campaign => (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">{campaign.name}</p><p className="text-sm text-muted-foreground">{campaign.description}</p></div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      <span className="text-sm text-muted-foreground">{campaign.recipients_count} destinatários</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {history.map(item => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">{getTypeIcon(item.type)}</div>
                    <div><p className="font-medium">{item.client_name}</p><p className="text-sm text-muted-foreground truncate max-w-md">{item.message}</p></div>
                  </div>
                  <div className="flex items-center gap-2"><Badge className={getStatusColor(item.status)}>{item.status}</Badge><span className="text-xs text-muted-foreground">{item.sent_at}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationsContent;
