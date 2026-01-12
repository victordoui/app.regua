import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Cake, MessageCircle, Gift } from 'lucide-react';
import { format, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Client {
  id: string;
  name: string;
  phone: string;
  birth_date?: string;
}

interface BirthdayClientsProps {
  clients: Client[];
}

const BirthdayClients = ({ clients }: BirthdayClientsProps) => {
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
      const today = new Date().getDate();
      return {
        ...client,
        dayOfMonth,
        isToday: dayOfMonth === today,
        isPast: dayOfMonth < today
      };
    }).sort((a, b) => a.dayOfMonth - b.dayOfMonth);
  }, [clients]);

  const sendBirthdayMessage = (client: Client) => {
    const message = encodeURIComponent(`🎂 Feliz Aniversário, ${client.name.split(' ')[0]}! Desejamos muitas felicidades. Temos uma surpresa especial para você na sua próxima visita!`);
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (birthdayClients.length === 0) {
    return null;
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
