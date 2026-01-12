import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, DollarSign, Scissors, TrendingUp, User, Star, Camera } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface ClientHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

interface AppointmentHistory {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  total_price: number | null;
  result_photo_url: string | null;
  service: { name: string; price: number } | null;
  barber: { display_name: string } | null;
}

interface ClientStats {
  totalAppointments: number;
  completedAppointments: number;
  totalSpent: number;
  averageTicket: number;
  favoriteService: string | null;
  lastVisit: string | null;
}

const ClientHistoryDialog = ({ open, onOpenChange, clientId, clientName }: ClientHistoryDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
    averageTicket: 0,
    favoriteService: null,
    lastVisit: null
  });

  useEffect(() => {
    if (open && clientId && user) {
      fetchClientHistory();
    }
  }, [open, clientId, user]);

  const fetchClientHistory = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch appointments with service and barber info
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          total_price,
          result_photo_url,
          service_id,
          barbeiro_id
        `)
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      // Fetch services and barbers separately
      const serviceIds = [...new Set(appointmentsData?.map(a => a.service_id).filter(Boolean))];
      const barberIds = [...new Set(appointmentsData?.map(a => a.barbeiro_id).filter(Boolean))];

      const [servicesRes, barbersRes] = await Promise.all([
        serviceIds.length > 0 
          ? supabase.from('services').select('id, name, price').in('id', serviceIds)
          : { data: [] },
        barberIds.length > 0
          ? supabase.from('profiles').select('id, display_name').in('id', barberIds)
          : { data: [] }
      ]);

      const servicesMap = new Map<string, { id: string; name: string; price: number }>();
      servicesRes.data?.forEach(s => servicesMap.set(s.id, s));
      const barbersMap = new Map<string, { id: string; display_name: string }>();
      barbersRes.data?.forEach(b => barbersMap.set(b.id, b));

      const enrichedAppointments: AppointmentHistory[] = (appointmentsData || []).map(apt => ({
        ...apt,
        result_photo_url: apt.result_photo_url,
        service: apt.service_id ? servicesMap.get(apt.service_id) ?? null : null,
        barber: apt.barbeiro_id ? barbersMap.get(apt.barbeiro_id) ?? null : null
      }));

      setAppointments(enrichedAppointments);

      // Calculate stats
      const completed = enrichedAppointments.filter(a => a.status === 'completed');
      const totalSpent = completed.reduce((sum, a) => sum + (a.total_price || a.service?.price || 0), 0);
      
      // Find favorite service
      const serviceCounts: Record<string, number> = {};
      enrichedAppointments.forEach(a => {
        if (a.service?.name) {
          serviceCounts[a.service.name] = (serviceCounts[a.service.name] || 0) + 1;
        }
      });
      const favoriteService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      setStats({
        totalAppointments: enrichedAppointments.length,
        completedAppointments: completed.length,
        totalSpent,
        averageTicket: completed.length > 0 ? totalSpent / completed.length : 0,
        favoriteService,
        lastVisit: completed[0]?.appointment_date || null
      });
    } catch (error) {
      console.error('Error fetching client history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      completed: { label: 'Concluído', variant: 'default' },
      confirmed: { label: 'Confirmado', variant: 'secondary' },
      pending: { label: 'Pendente', variant: 'outline' },
      cancelled: { label: 'Cancelado', variant: 'destructive' }
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Histórico de {clientName}
          </DialogTitle>
          <DialogDescription>
            Visualize o histórico completo de atendimentos e estatísticas do cliente.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Total de Visitas</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">Total Gasto</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalSpent)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">Ticket Médio</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.averageTicket)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Star className="h-4 w-4" />
                      <span className="text-xs">Concluídos</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.completedAppointments}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Scissors className="h-4 w-4" />
                      <span className="text-xs">Serviço Favorito</span>
                    </div>
                    <p className="text-lg font-medium truncate">{stats.favoriteService || '-'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Última Visita</span>
                    </div>
                    <p className="text-lg font-medium">
                      {stats.lastVisit 
                        ? format(new Date(stats.lastVisit), "dd/MM/yyyy", { locale: ptBR })
                        : '-'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum agendamento encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((apt) => (
                      <Card key={apt.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{apt.service?.name || 'Serviço não encontrado'}</span>
                                {getStatusBadge(apt.status)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(apt.appointment_date), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {apt.appointment_time.slice(0, 5)}
                                </span>
                              </div>
                              {apt.barber && (
                                <p className="text-sm text-muted-foreground">
                                  Barbeiro: {apt.barber.display_name}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                                  .format(apt.total_price || apt.service?.price || 0)}
                              </p>
                              {apt.result_photo_url && (
                                <a 
                                  href={apt.result_photo_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                >
                                  <Camera className="h-3 w-3" />
                                  Ver foto
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientHistoryDialog;
