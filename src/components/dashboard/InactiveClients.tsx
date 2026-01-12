import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserX, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Client {
  id: string;
  name: string;
  phone: string;
  lastAppointment?: string;
}

interface InactiveClientsProps {
  clients: Client[];
  inactiveDays?: number;
}

const InactiveClients = ({ clients, inactiveDays = 30 }: InactiveClientsProps) => {
  const inactiveClients = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
    
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

  if (inactiveClients.length === 0) {
    return null;
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
