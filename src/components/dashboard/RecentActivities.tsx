import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  UserPlus, 
  CreditCard, 
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'appointment_created' | 'appointment_completed' | 'appointment_cancelled' | 'client_created' | 'subscription_created' | 'payment_received';
  title: string;
  description: string;
  timestamp: Date;
}

const activityConfig = {
  appointment_created: {
    icon: Calendar,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Agendamento'
  },
  appointment_completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Concluído'
  },
  appointment_cancelled: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Cancelado'
  },
  client_created: {
    icon: UserPlus,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'Novo Cliente'
  },
  subscription_created: {
    icon: Star,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Assinatura'
  },
  payment_received: {
    icon: CreditCard,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    label: 'Pagamento'
  }
};

const RecentActivities: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial activities
  const fetchActivities = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Fetch recent appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, status, appointment_date, appointment_time, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15);

      // Fetch recent clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, first_name, last_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort activities
      const allActivities: ActivityItem[] = [];

      (appointments || []).forEach(apt => {
        let type: ActivityItem['type'] = 'appointment_created';
        let title = 'Novo agendamento';

        if (apt.status === 'completed') {
          type = 'appointment_completed';
          title = 'Agendamento concluído';
        } else if (apt.status === 'cancelled') {
          type = 'appointment_cancelled';
          title = 'Agendamento cancelado';
        }

        allActivities.push({
          id: apt.id,
          type,
          title,
          description: `${format(parseISO(apt.appointment_date), 'dd/MM')} às ${apt.appointment_time}`,
          timestamp: new Date(apt.created_at)
        });
      });

      (clients || []).forEach(client => {
        allActivities.push({
          id: client.id,
          type: 'client_created',
          title: 'Novo cliente',
          description: `${client.first_name || ''} ${client.last_name || ''}`.trim(),
          timestamp: new Date(client.created_at)
        });
      });

      // Sort by timestamp
      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Handle realtime updates
  const handleNewActivity = useCallback((type: ActivityItem['type'], data: any) => {
    const newActivity: ActivityItem = {
      id: data.id || crypto.randomUUID(),
      type,
      title: type === 'client_created' ? 'Novo cliente' : 'Novo agendamento',
      description: type === 'client_created' 
        ? `${data.first_name || ''} ${data.last_name || ''}`.trim()
        : `${format(parseISO(data.appointment_date), 'dd/MM')} às ${data.appointment_time}`,
      timestamp: new Date()
    };

    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchActivities();

    // Listen for new appointments
    const appointmentsChannel = supabase
      .channel('activities-appointments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleNewActivity('appointment_created', payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const apt = payload.new as any;
          if (apt.status === 'completed') {
            handleNewActivity('appointment_completed', apt);
          } else if (apt.status === 'cancelled') {
            handleNewActivity('appointment_cancelled', apt);
          }
        }
      )
      .subscribe();

    // Listen for new clients
    const clientsChannel = supabase
      .channel('activities-clients')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleNewActivity('client_created', payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(clientsChannel);
    };
  }, [user?.id, fetchActivities, handleNewActivity]);

  const formatTimestamp = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true, locale: ptBR });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Tempo real
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Activity className="h-12 w-12 mb-2 opacity-50" />
              <p>Nenhuma atividade recente</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {activities.map((activity, index) => {
                  const config = activityConfig[activity.type];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${config.bgColor}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {activity.title}
                          </p>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
