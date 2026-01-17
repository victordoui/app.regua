import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EmailCampaign {
  id: string;
  user_id: string;
  subject: string;
  content: string;
  target_segment: string;
  scheduled_at: string | null;
  sent_at: string | null;
  recipients_count: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  created_at: string;
}

export interface CampaignFormData {
  subject: string;
  content: string;
  target_segment?: 'all' | 'inactive' | 'birthday' | 'new';
  scheduled_at?: string | null;
  status?: 'draft' | 'scheduled' | 'sent' | 'failed';
}

export const TARGET_SEGMENTS = {
  all: { label: 'Todos os Clientes', description: 'Enviar para toda a base de clientes' },
  inactive: { label: 'Clientes Inativos', description: 'Clientes sem agendamento há mais de 30 dias' },
  birthday: { label: 'Aniversariantes', description: 'Clientes que fazem aniversário este mês' },
  new: { label: 'Novos Clientes', description: 'Clientes cadastrados nos últimos 30 dias' }
};

export const useEmailCampaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchCampaigns = useCallback(async (): Promise<EmailCampaign[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as EmailCampaign[];
  }, [user]);

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['email_campaigns', user?.id],
    queryFn: fetchCampaigns,
    enabled: !!user
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (formData: CampaignFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          user_id: user.id,
          subject: formData.subject,
          content: formData.content,
          target_segment: formData.target_segment || 'all',
          scheduled_at: formData.scheduled_at || null,
          status: formData.scheduled_at ? 'scheduled' : 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_campaigns'] });
      toast({ title: 'Campanha criada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar campanha', description: error.message, variant: 'destructive' });
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, ...formData }: Partial<CampaignFormData> & { id: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          subject: formData.subject,
          content: formData.content,
          target_segment: formData.target_segment,
          scheduled_at: formData.scheduled_at,
          status: formData.status
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_campaigns'] });
      toast({ title: 'Campanha atualizada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar campanha', description: error.message, variant: 'destructive' });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_campaigns'] });
      toast({ title: 'Campanha removida!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover campanha', description: error.message, variant: 'destructive' });
    }
  });

  const getCampaignsByStatus = (status: string) => {
    return campaigns.filter(c => c.status === status);
  };

  return {
    campaigns,
    isLoading,
    error,
    createCampaign: createCampaignMutation.mutateAsync,
    updateCampaign: updateCampaignMutation.mutateAsync,
    deleteCampaign: deleteCampaignMutation.mutateAsync,
    getCampaignsByStatus,
    isCreating: createCampaignMutation.isPending,
    isUpdating: updateCampaignMutation.isPending,
    isDeleting: deleteCampaignMutation.isPending
  };
};
