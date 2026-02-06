import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useSupportTickets, useTicketMessages } from '@/hooks/superadmin/useSupportTickets';
import { ArrowLeft, Send, Clock, CheckCircle, User, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { TicketStatus, TicketPriority } from '@/types/superAdmin';

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  resolved: 'bg-green-500/10 text-green-600 border-green-500/20',
  closed: 'bg-muted text-muted-foreground border-muted',
};

const statusLabels: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em Andamento',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-primary/10 text-primary',
  high: 'bg-amber-500/10 text-amber-600',
  urgent: 'bg-destructive/10 text-destructive',
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { tickets, updateTicketStatus, isUpdating } = useSupportTickets();
  const { messages, addMessage, isSending } = useTicketMessages(id || '');

  const ticket = tickets.find((t) => t.id === id);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    addMessage({ message: newMessage, isInternal });
    setNewMessage('');
    setIsInternal(false);
  };

  if (!ticket) {
    return (
      <SuperAdminLayout>
        <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
          <p>Ticket não encontrado</p>
          <Button variant="link" onClick={() => navigate('/superadmin/support')}>
            Voltar para lista
          </Button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/superadmin/support')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{ticket.subject}</h1>
            <p className="text-muted-foreground">
              Ticket #{ticket.id.slice(0, 8)} • Criado em{' '}
              {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={priorityColors[ticket.priority]}>
              {priorityLabels[ticket.priority]}
            </Badge>
            <Badge className={statusColors[ticket.status]}>
              {statusLabels[ticket.status]}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mensagens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma mensagem ainda
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg ${
                          message.is_internal
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {message.is_internal ? (
                            <Lock className="h-4 w-4 text-amber-500" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">
                            {message.sender_id.slice(0, 8)}...
                          </span>
                          {message.is_internal && (
                            <Badge variant="outline" className="text-xs bg-amber-500/10">
                              Interno
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {format(new Date(message.created_at), "dd/MM 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Message Form */}
                <div className="pt-4 border-t border-border">
                  <Textarea
                    placeholder="Escreva sua resposta..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="internal"
                        checked={isInternal}
                        onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                      />
                      <label htmlFor="internal" className="text-sm text-muted-foreground">
                        Nota interna (não visível ao usuário)
                      </label>
                    </div>
                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ticket.status !== 'in_progress' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => updateTicketStatus({ id: ticket.id, status: 'in_progress' })}
                    disabled={isUpdating}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Marcar Em Andamento
                  </Button>
                )}
                {ticket.status !== 'resolved' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => updateTicketStatus({ id: ticket.id, status: 'resolved' })}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar Resolvido
                  </Button>
                )}
                {ticket.status !== 'closed' && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => updateTicketStatus({ id: ticket.id, status: 'closed' })}
                    disabled={isUpdating}
                  >
                    Fechar Ticket
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Usuário</p>
                  <p className="font-mono">{ticket.user_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Criado em</p>
                  <p>
                    {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {ticket.resolved_at && (
                  <div>
                    <p className="text-muted-foreground">Resolvido em</p>
                    <p>
                      {format(new Date(ticket.resolved_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}
                {ticket.assigned_to && (
                  <div>
                    <p className="text-muted-foreground">Atribuído a</p>
                    <p className="font-mono">{ticket.assigned_to.slice(0, 8)}...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default TicketDetail;
