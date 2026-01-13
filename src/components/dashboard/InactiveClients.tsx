import { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserX, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  phone: string;
  lastAppointment?: string;
}

interface InactiveClientsProps {
  clients?: Client[];
  inactiveDays?: number;
}

const InactiveClients = ({ clients: propClients, inactiveDays = 30 }: InactiveClientsProps = {}) => {
  const { user } = useAuth();
  const [fetchedClients, setFetchedClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(!propClients);

  const fetchClientsWithLastAppointment = useCallback(async () => {
    if (!user?.id || propClients) return;

    try {
      setIsLoading(true);

      // Get all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, first_name, last_name, phone')
        .eq('user_id', user.id);

      if (clientsError) throw clientsError;

      // Get last appointment for each client
      const clientsWithLastAppointment = await Promise.all(
        (clientsData || []).map(async (client) => {
          const { data: lastApt } = await supabase
            .from('appointments')
            .select('appointment_date')
            .eq('client_id', client.id)
            .eq('status', 'completed')
            .order('appointment_date', { ascending: false })
            .limit(1)
            .single();

          return {
            id: client.id,
            name: `${client.first_name || ''} ${client.last_name || ''}`.trim(),
            phone: client.phone || '',
            lastAppointment: lastApt?.appointment_date
          };
        })
      );

      setFetchedClients(clientsWithLastAppointment);
    } catch (error) {
      console.error('Error fetching inactive clients:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, propClients]);

  useEffect(() => {
    fetchClientsWithLastAppointment();
  }, [fetchClientsWithLastAppointment]);

  // Setup realtime subscription
  useEffect(() => {
    if (!user?.id || propClients) return;

    const clientsChannel = supabase
      .channel('inactive-clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchClientsWithLastAppointment()
      )
      .subscribe();

    const appointmentsChannel = supabase
      .channel('inactive-appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchClientsWithLastAppointment()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(appointmentsChannel);
    };
  }, [user?.id, propClients, fetchClientsWithLastAppointment]);

  const clients = propClients || fetchedClients;

  const inactiveClients = useMemo(() => {
    const cutoffDate = subDays(new Date(), inactiveDays);
    
    return clients
      .filter(client => {
        if (!client.lastAppointment) return true;
        return new Date(client.lastAppointment) < cutoffDate;
      })
      .map(client => ({
        ...client,
        daysSinceLastVisit: client.lastAppointment
          ? Math.floor((Date.now() - new Date(client.lastAppointment).getTime()) / (1000 * 60 * 60 * 24))
          : null
      }))
      .sort((a, b) => (b.daysSinceLastVisit || 999) - (a.daysSinceLastVisit || 999))
      .slice(0, 10);
  }, [clients, inactiveDays]);

  const sendReengagementMessage = (client: Client) => {
    const message = encodeURIComponent(`Olá ${client.name.split(' ')[0]}! 👋 Sentimos sua falta aqui na barbearia. Que tal agendar um horário? Temos novidades esperando por você!`);
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserX className="h-5 w-5 text-orange-500" />
            Clientes Inativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Carregando...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inactiveClients.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserX className="h-5 w-5 text-orange-500" />
            Clientes Inativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Todos os clientes estão ativos! 🎉
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserX className="h-5 w-5 text-orange-500" />
          Clientes Inativos
        </CardTitle>
        <CardDescription>
          Clientes sem agendamento há mais de {inactiveDays} dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {inactiveClients.map(client => (
            <div key={client.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-orange-500/10 text-orange-500">
                    {client.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {client.lastAppointment
                      ? formatDistanceToNow(new Date(client.lastAppointment), { addSuffix: true, locale: ptBR })
                      : 'Nunca agendou'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {client.daysSinceLastVisit && client.daysSinceLastVisit > 60 && (
                  <Badge variant="outline" className="text-red-500 border-red-500 text-xs">
                    +{client.daysSinceLastVisit}d
                  </Badge>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => sendReengagementMessage(client)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InactiveClients;
