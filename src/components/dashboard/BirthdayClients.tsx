import { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Cake, MessageCircle, Gift } from 'lucide-react';
import { format, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  phone: string;
  birth_date?: string;
}

interface BirthdayClientsProps {
  clients?: Client[];
}

const BirthdayClients = ({ clients: propClients }: BirthdayClientsProps = {}) => {
  const { user } = useAuth();
  const [fetchedClients, setFetchedClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(!propClients);

  const fetchClients = useCallback(async () => {
    if (!user?.id || propClients) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, phone, birth_date')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedClients = (data || []).map(c => ({
        id: c.id,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
        phone: c.phone || '',
        birth_date: c.birth_date
      }));

      setFetchedClients(formattedClients);
    } catch (error) {
      console.error('Error fetching clients for birthdays:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, propClients]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Setup realtime subscription
  useEffect(() => {
    if (!user?.id || propClients) return;

    const channel = supabase
      .channel('birthday-clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchClients()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, propClients, fetchClients]);

  const clients = propClients || fetchedClients;

  const birthdayClients = useMemo(() => {
    const today = new Date();
    return clients.filter(client => {
      if (!client.birth_date) return false;
      try {
        const birthDate = parseISO(client.birth_date);
        return isSameMonth(birthDate, today);
      } catch {
        return false;
      }
    }).map(client => {
      const birthDate = parseISO(client.birth_date!);
      const dayOfMonth = birthDate.getDate();
      const todayDate = new Date().getDate();
      return {
        ...client,
        dayOfMonth,
        isToday: dayOfMonth === todayDate,
        isPast: dayOfMonth < todayDate
      };
    }).sort((a, b) => a.dayOfMonth - b.dayOfMonth);
  }, [clients]);

  const sendBirthdayMessage = (client: Client) => {
    const message = encodeURIComponent(`🎂 Feliz Aniversário, ${client.name.split(' ')[0]}! Desejamos muitas felicidades. Temos uma surpresa especial para você na sua próxima visita!`);
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cake className="h-5 w-5 text-pink-500" />
            Aniversariantes do Mês
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

  if (birthdayClients.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cake className="h-5 w-5 text-pink-500" />
            Aniversariantes do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Nenhum aniversariante este mês
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cake className="h-5 w-5 text-pink-500" />
          Aniversariantes do Mês
        </CardTitle>
        <CardDescription>
          {birthdayClients.length} cliente{birthdayClients.length > 1 ? 's' : ''} fazem aniversário este mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {birthdayClients.slice(0, 5).map(client => (
            <div key={client.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={client.isToday ? 'bg-pink-500 text-white' : ''}>
                    {client.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {client.name}
                    {client.isToday && (
                      <Badge className="bg-pink-500 text-xs">
                        <Gift className="h-3 w-3 mr-1" />Hoje!
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dia {client.dayOfMonth} de {format(new Date(), 'MMMM', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant={client.isToday ? 'default' : 'outline'}
                onClick={() => sendBirthdayMessage(client)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Enviar
              </Button>
            </div>
          ))}
          
          {birthdayClients.length > 5 && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              + {birthdayClients.length - 5} outros aniversariantes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdayClients;
