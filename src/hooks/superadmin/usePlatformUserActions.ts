import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PlatformUserAction = 'suspend' | 'activate' | 'ban' | 'unban' | 'revoke_sessions' | 'delete';

interface ActionInput {
  action: PlatformUserAction;
  targetUserId: string;
  confirmation?: string;
}

const actionLabels: Record<PlatformUserAction, string> = {
  suspend: 'Assinatura suspensa',
  activate: 'Acesso reativado',
  ban: 'Usuário banido',
  unban: 'Usuário desbanido',
  revoke_sessions: 'Sessões revogadas',
  delete: 'Acesso excluído',
};

export function usePlatformUserActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ action, targetUserId, confirmation }: ActionInput) => {
      const { data, error } = await supabase.functions.invoke('manage-platform-user', {
        body: { action, target_user_id: targetUserId, confirmation },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return { action };
    },
    onSuccess: ({ action }) => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] });
      queryClient.invalidateQueries({ queryKey: ['platform-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['platform-audit-logs'] });
      toast({ title: actionLabels[action] });
    },
    onError: (error: Error) => {
      toast({ title: 'Ação não concluída', description: error.message, variant: 'destructive' });
    },
  });

  return { runAction: mutation.mutateAsync, isUpdating: mutation.isPending };
}
