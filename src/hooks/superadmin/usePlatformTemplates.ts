import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { EmailTemplate, EmailTemplateFormData } from '@/types/superAdmin';

export const usePlatformTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const templatesQuery = useQuery({
    queryKey: ['platform-templates'],
    queryFn: async (): Promise<EmailTemplate[]> => {
      const { data, error } = await supabase
        .from('platform_email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as EmailTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (formData: EmailTemplateFormData) => {
      const { error } = await supabase.from('platform_email_templates').insert(formData);

      if (error) throw error;

      // Log action
      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'create_template',
        details: { name: formData.name } as any,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-templates'] });
      toast({ title: 'Template criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmailTemplateFormData> }) => {
      const { error } = await supabase
        .from('platform_email_templates')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'update_template',
        details: { template_id: id, ...data } as any,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-templates'] });
      toast({ title: 'Template atualizado com sucesso!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await supabase.from('platform_audit_logs').insert([{
        super_admin_id: user?.id || '',
        action: 'delete_template',
        details: { template_id: id } as any,
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-templates'] });
      toast({ title: 'Template excluído!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleTemplateActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('platform_email_templates')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-templates'] });
      toast({ title: 'Template atualizado!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    error: templatesQuery.error,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    toggleTemplateActive: toggleTemplateActive.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
};
