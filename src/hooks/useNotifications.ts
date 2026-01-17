import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

// Types
export interface NotificationTemplate {
  id: string;
  user_id: string;
  name: string;
  type: 'sms' | 'email' | 'whatsapp' | 'push';
  trigger: 'appointment_reminder' | 'appointment_confirmation' | 'appointment_cancellation' | 
           'birthday' | 'promotion' | 'feedback_request' | 'welcome' | 'custom';
  subject?: string;
  message: string;
  timing_hours: number;
  active: boolean;
  variables?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface NotificationCampaign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'promotional' | 'informational' | 'reminder';
  target_audience: 'all' | 'subscribers' | 'vip' | 'inactive' | 'birthday';
  channels: string[];
  template_id?: string;
  custom_message?: string;
  scheduled_date?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  open_rate?: number;
  click_rate?: number;
  created_at?: string;
  updated_at?: string;
  sent_at?: string;
  notification_templates?: NotificationTemplate;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  client_id?: string;
  campaign_id?: string;
  template_id?: string;
  channel: 'sms' | 'email' | 'whatsapp' | 'push' | 'system';
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'bounced';
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  delivered_at?: string;
  read_at?: string;
  clients?: { name: string };
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  system_enabled?: boolean;
  email_enabled?: boolean;
  email_address?: string | null;
  whatsapp_enabled?: boolean;
  whatsapp_number?: string | null;
  push_enabled?: boolean;
  push_subscription?: unknown;
  reminder_hours_before?: number;
}

export interface CreateTemplateInput {
  name: string;
  type: NotificationTemplate['type'];
  trigger: NotificationTemplate['trigger'];
  subject?: string;
  message: string;
  timing_hours?: number;
  active?: boolean;
  variables?: string[];
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  type: NotificationCampaign['type'];
  target_audience: NotificationCampaign['target_audience'];
  channels: string[];
  template_id?: string;
  custom_message?: string;
  scheduled_date?: string;
}

export interface SendNotificationParams {
  channel: 'email' | 'whatsapp' | 'push' | 'system';
  recipient: string;
  subject?: string;
  message: string;
  clientId?: string | null;
  templateId?: string | null;
  campaignId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ==================== TEMPLATES ====================
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NotificationTemplate[];
    },
    enabled: !!user?.id,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          user_id: user.id,
          name: input.name,
          type: input.type,
          trigger: input.trigger,
          subject: input.subject,
          message: input.message,
          timing_hours: input.timing_hours || 24,
          active: input.active ?? true,
          variables: input.variables || [],
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({ title: 'Template criado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar template', description: error.message, variant: 'destructive' });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NotificationTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({ title: 'Template atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar template', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({ title: 'Template removido!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover template', description: error.message, variant: 'destructive' });
    },
  });

  const toggleTemplate = async (id: string, active: boolean) => {
    await updateTemplateMutation.mutateAsync({ id, active });
  };

  // ==================== CAMPAIGNS ====================
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['notification-campaigns', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notification_campaigns')
        .select('*, notification_templates(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NotificationCampaign[];
    },
    enabled: !!user?.id,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (input: CreateCampaignInput) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const status = input.scheduled_date ? 'scheduled' : 'draft';
      
      const { data, error } = await supabase
        .from('notification_campaigns')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description,
          type: input.type,
          target_audience: input.target_audience,
          channels: input.channels,
          template_id: input.template_id,
          custom_message: input.custom_message,
          scheduled_date: input.scheduled_date,
          status,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-campaigns'] });
      toast({ title: 'Campanha criada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar campanha', description: error.message, variant: 'destructive' });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NotificationCampaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('notification_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-campaigns'] });
      toast({ title: 'Campanha atualizada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar campanha', description: error.message, variant: 'destructive' });
    },
  });

  const cancelCampaign = async (id: string) => {
    await updateCampaignMutation.mutateAsync({ id, status: 'cancelled' });
  };

  const sendCampaignNow = async (campaignId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-campaign', {
        body: { campaign_id: campaignId },
      });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['notification-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
      toast({ title: 'Campanha enviada com sucesso!' });
    } catch (error) {
      toast({ 
        title: 'Erro ao enviar campanha', 
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
  };

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-campaigns'] });
      toast({ title: 'Campanha removida!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover campanha', description: error.message, variant: 'destructive' });
    },
  });

  // ==================== LOGS ====================
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['notification-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*, clients(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as NotificationLog[];
    },
    enabled: !!user?.id,
  });

  // ==================== PREFERENCES ====================
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as NotificationPreferences | null;
    },
    enabled: !!user?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      // First check if record exists
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let data, error;
      const cleanUpdates = { ...updates } as Record<string, unknown>;
      delete cleanUpdates.id;
      delete cleanUpdates.user_id;
      
      if (existing) {
        const result = await supabase
          .from('notification_preferences')
          .update(cleanUpdates as never)
          .eq('user_id', user.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('notification_preferences')
          .insert([{
            user_id: user.id,
            ...cleanUpdates,
          } as never])
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({ title: 'Preferências atualizadas!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar preferências', description: error.message, variant: 'destructive' });
    },
  });

  // ==================== SEND NOTIFICATION ====================
  const sendNotification = async (params: SendNotificationParams) => {
    if (!user?.id) throw new Error('Usuário não autenticado');
    
    // Log the notification
    const { data: log, error: logError } = await supabase
      .from('notification_logs')
      .insert([{
        user_id: user.id,
        channel: params.channel,
        recipient: params.recipient,
        subject: params.subject || null,
        message: params.message,
        client_id: params.clientId || null,
        template_id: params.templateId || null,
        campaign_id: params.campaignId || null,
        metadata: (params.metadata || {}) as never,
        status: 'pending',
      }])
      .select()
      .single();
    
    if (logError) throw logError;
    
    try {
      // Send based on channel
      if (params.channel === 'email') {
        // Call email edge function
        const { error } = await supabase.functions.invoke('send-email-notification', {
          body: {
            to: params.recipient,
            subject: params.subject,
            html: params.message,
          },
        });
        if (error) throw error;
      } else if (params.channel === 'whatsapp') {
        const { error } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            phone: params.recipient,
            message: params.message,
          },
        });
        if (error) throw error;
      } else if (params.channel === 'push') {
        const { error } = await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: params.clientId,
            title: params.subject,
            body: params.message,
          },
        });
        if (error) throw error;
      }
      
      // Update log status
      await supabase
        .from('notification_logs')
        .update({ status: 'sent', delivered_at: new Date().toISOString() })
        .eq('id', log.id);
      
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
      return log;
    } catch (error) {
      // Update log with error
      await supabase
        .from('notification_logs')
        .update({ 
          status: 'failed', 
          error_message: error instanceof Error ? error.message : 'Erro desconhecido' 
        })
        .eq('id', log.id);
      
      throw error;
    }
  };

  // ==================== STATISTICS ====================
  const stats = useMemo(() => {
    const totalSent = logs.filter(l => ['sent', 'delivered', 'read'].includes(l.status)).length;
    const totalFailed = logs.filter(l => ['failed', 'bounced'].includes(l.status)).length;
    const totalDelivered = logs.filter(l => ['delivered', 'read'].includes(l.status)).length;
    const totalRead = logs.filter(l => l.status === 'read').length;
    
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
    const activeCampaigns = campaigns.filter(c => c.status === 'scheduled').length;
    const activeTemplates = templates.filter(t => t.active).length;
    
    return {
      totalSent,
      totalFailed,
      totalDelivered,
      totalRead,
      deliveryRate: Math.round(deliveryRate * 10) / 10,
      openRate: Math.round(openRate * 10) / 10,
      activeCampaigns,
      activeTemplates,
    };
  }, [logs, campaigns, templates]);

  // ==================== HELPERS ====================
  const getTemplatesByType = (type: NotificationTemplate['type']) => 
    templates.filter(t => t.type === type);

  const getTemplatesByTrigger = (trigger: NotificationTemplate['trigger']) => 
    templates.filter(t => t.trigger === trigger);

  const getCampaignsByStatus = (status: NotificationCampaign['status']) => 
    campaigns.filter(c => c.status === status);

  const getLogsByChannel = (channel: NotificationLog['channel']) => 
    logs.filter(l => l.channel === channel);

  return {
    // Templates
    templates,
    templatesLoading,
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: updateTemplateMutation.mutateAsync,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    toggleTemplate,
    getTemplatesByType,
    getTemplatesByTrigger,
    
    // Campaigns
    campaigns,
    campaignsLoading,
    createCampaign: createCampaignMutation.mutateAsync,
    updateCampaign: updateCampaignMutation.mutateAsync,
    deleteCampaign: deleteCampaignMutation.mutateAsync,
    cancelCampaign,
    sendCampaignNow,
    getCampaignsByStatus,
    
    // Logs
    logs,
    logsLoading,
    getLogsByChannel,
    
    // Preferences
    preferences,
    preferencesLoading,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    
    // Send
    sendNotification,
    
    // Stats
    stats,
    
    // Loading states
    isLoading: templatesLoading || campaignsLoading || logsLoading,
  };
}
