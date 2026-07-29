import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Indica se o usuário logado possui um negócio próprio (barbershop_settings).
 * Usado principalmente pelo Super Admin para saber se a troca de contexto
 * ("Voltar ao meu negócio") leva a um painel com dados reais.
 */
export const useHasOwnBusiness = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['has-own-business', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbershop_settings')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
  });

  return {
    hasOwnBusiness: query.data ?? false,
    isLoading: query.isLoading,
  };
};
