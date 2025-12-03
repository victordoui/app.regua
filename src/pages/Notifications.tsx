import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Calendar, Clock, AlertCircle, CheckCircle2, Trash2, Settings, Filter, RefreshCw } from "lucide-react";
import Layout from "@/components/Layout";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [settings, setSettings] = useState({
    appointments: true,
    reminders: true,
    alerts: true,
    email: false,
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          setNotifications(prev => [payload.new as Notification, ...prev]);
          toast({
            title: (payload.new as Notification).title,
            description: (payload.new as Notification).message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar notificações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerReminders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-appointment-reminders');
      
      if (error) throw error;
      
      toast({
        title: "Lembretes enviados",
        description: `${data?.notificationsSent || 0} lembretes foram criados.`,
      });
      
      fetchNotifications();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar lembretes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (error: any) {
      toast({
        title: "Erro ao marcar como lida",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const unreadIds = notifications
        .filter(n => !n.read_at)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
      );

      toast({
        title: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao marcar todas como lidas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      toast({
        title: "Notificação excluída",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir notificação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "reminder":
        return <Clock className="h-4 w-4" />;
      case "alert":
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "reminder":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "alert":
      case "warning":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.read_at;
    if (filter === "read") return notif.read_at;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return "Ontem";
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Carregando notificações...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Central de notificações do sistema</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={triggerReminders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Enviar Lembretes
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros e Configurações */}
          <div className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas ({notifications.length})</SelectItem>
                    <SelectItem value="unread">Não lidas ({unreadCount})</SelectItem>
                    <SelectItem value="read">Lidas ({notifications.length - unreadCount})</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </CardTitle>
                <CardDescription>
                  Configure suas preferências de notificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="appointments">Agendamentos</Label>
                    <Switch
                      id="appointments"
                      checked={settings.appointments}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, appointments: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminders">Lembretes</Label>
                    <Switch
                      id="reminders"
                      checked={settings.reminders}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, reminders: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alerts">Alertas</Label>
                    <Switch
                      id="alerts"
                      checked={settings.alerts}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, alerts: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email">Email</Label>
                    <Switch
                      id="email"
                      checked={settings.email}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Notificações */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${
                    !notification.read_at ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                        {getTypeIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-foreground">
                              {notification.title}
                            </h3>
                            {!notification.read_at && (
                              <Badge variant="secondary" className="mt-1">
                                Nova
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-2">
                          {!notification.read_at && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Marcar como Lida
                            </Button>
                          )}
                          
                          {notification.action_url && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                if (!notification.read_at) {
                                  markAsRead(notification.id);
                                }
                                window.location.href = notification.action_url!;
                              }}
                            >
                              Ver Detalhes
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {filter === "unread" 
                      ? "Nenhuma notificação não lida"
                      : filter === "read"
                      ? "Nenhuma notificação lida"
                      : "Nenhuma notificação"
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {filter === "all" 
                      ? "Quando houver novidades, elas aparecerão aqui."
                      : "Altere o filtro para ver outras notificações."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
