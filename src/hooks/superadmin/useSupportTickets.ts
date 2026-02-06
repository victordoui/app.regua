import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { SupportTicket, TicketMessage, TicketFilters, TicketStatus } from '@/types/superAdmin';

export const useSupportTickets = (filters?: TicketFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const ticketsQuery = useQuery({
    queryKey: ['platform-tickets', filters],
    queryFn: async (): Promise<SupportTicket[]> => {
      let query = supabase
        .from('platform_support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SupportTicket[];
    },
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const updates: any = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('platform_support_tickets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'resolve_ticket',
        details: { ticket_id: id, status } as any,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tickets'] });
      toast({ title: 'Status do ticket atualizado!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const assignTicket = useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string | null }) => {
      const { error } = await supabase
        .from('platform_support_tickets')
        .update({ assigned_to: assignedTo, status: 'in_progress' })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'assign_ticket',
        details: { ticket_id: id, assigned_to: assignedTo } as any,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-tickets'] });
      toast({ title: 'Ticket atribuído!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atribuir ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    tickets: ticketsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    error: ticketsQuery.error,
    updateTicketStatus: updateTicketStatus.mutate,
    assignTicket: assignTicket.mutate,
    isUpdating: updateTicketStatus.isPending,
  };
};

export const useTicketMessages = (ticketId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const messagesQuery = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: async (): Promise<TicketMessage[]> => {
      const { data, error } = await supabase
        .from('platform_ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as TicketMessage[];
    },
    enabled: !!ticketId,
  });

  const addMessage = useMutation({
    mutationFn: async ({ message, isInternal }: { message: string; isInternal: boolean }) => {
      const { error } = await supabase.from('platform_ticket_messages').insert({
        ticket_id: ticketId,
        sender_id: user?.id,
        message,
        is_internal: isInternal,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
      toast({ title: 'Mensagem enviada!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    addMessage: addMessage.mutate,
    isSending: addMessage.isPending,
  };
};

export const useTicketStats = () => {
  return useQuery({
    queryKey: ['platform-ticket-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_support_tickets')
        .select('status, priority');

      if (error) throw error;

      const tickets = data || [];
      return {
        total: tickets.length,
        open: tickets.filter((t: any) => t.status === 'open').length,
        in_progress: tickets.filter((t: any) => t.status === 'in_progress').length,
        urgent: tickets.filter((t: any) => t.priority === 'urgent' && t.status !== 'closed').length,
      };
    },
  });
};
