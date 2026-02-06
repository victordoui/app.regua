import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { BroadcastMessage, BroadcastFormData } from '@/types/superAdmin';

export const usePlatformBroadcast = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const broadcastQuery = useQuery({
    queryKey: ['platform-broadcast'],
    queryFn: async (): Promise<BroadcastMessage[]> => {
      const { data, error } = await supabase
        .from('platform_broadcast_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as BroadcastMessage[];
    },
  });

  const createBroadcast = useMutation({
    mutationFn: async (formData: BroadcastFormData) => {
      const { error } = await supabase.from('platform_broadcast_messages').insert({
        ...formData,
        created_by: user?.id,
      });

      if (error) throw error;

      // Log action
      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'send_broadcast',
        details: formData as any,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-broadcast'] });
      toast({ title: 'Mensagem criada com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const sendBroadcast = useMutation({
    mutationFn: async (id: string) => {
      // Get subscribers based on broadcast targeting
      const { data: broadcast, error: fetchError } = await supabase
        .from('platform_broadcast_messages')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      let subscribersQuery = supabase
        .from('platform_subscriptions')
        .select('user_id');

      if (broadcast.target_plans && broadcast.target_plans.length > 0) {
        subscribersQuery = subscribersQuery.in('plan_type', broadcast.target_plans);
      }
      if (broadcast.target_status && broadcast.target_status.length > 0) {
        subscribersQuery = subscribersQuery.in('status', broadcast.target_status);
      }

      const { data: subscribers, error: subsError } = await subscribersQuery;
      if (subsError) throw subsError;

      const sentCount = subscribers?.length || 0;

      // Update broadcast as sent
      const { error: updateError } = await supabase
        .from('platform_broadcast_messages')
        .update({
          sent_at: new Date().toISOString(),
          sent_count: sentCount,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      return { sentCount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['platform-broadcast'] });
      toast({ title: `Mensagem enviada para ${data.sentCount} assinantes!` });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteBroadcast = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_broadcast_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-broadcast'] });
      toast({ title: 'Mensagem excluída!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    broadcasts: broadcastQuery.data || [],
    isLoading: broadcastQuery.isLoading,
    error: broadcastQuery.error,
    createBroadcast: createBroadcast.mutate,
    sendBroadcast: sendBroadcast.mutate,
    deleteBroadcast: deleteBroadcast.mutate,
    isCreating: createBroadcast.isPending,
    isSending: sendBroadcast.isPending,
  };
};
