import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { defaultTVConfig, tvConfigSchema, type TVConfig } from '@/lib/tvDisplay';

export function useTVDisplay() {
  const { user } = useAuth();
  const client = useQueryClient();
  const key = ['tv-display', user?.id];
  const query = useQuery({ queryKey: key, enabled: !!user, refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await supabase.from('tv_display_settings').select('config').eq('user_id', user!.id).maybeSingle();
      if (error) throw error;
      return data ? tvConfigSchema.parse(data.config) : defaultTVConfig;
    },
  });
  const mutation = useMutation({ mutationFn: async (config: TVConfig) => {
    if (!user) throw new Error('Entre na sua conta para salvar.');
    const validated = tvConfigSchema.parse(config);
    const { error } = await supabase.from('tv_display_settings').upsert({ user_id: user.id, config: JSON.parse(JSON.stringify(validated)), updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) throw error;
  }, onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  return { ...query, save: mutation.mutateAsync, isSaving: mutation.isPending };
}
