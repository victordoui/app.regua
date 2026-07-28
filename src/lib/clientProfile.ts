import { supabase } from '@/integrations/supabase/client';

/**
 * Garante que o cliente autenticado tenha um perfil vinculado à barbearia atual.
 *
 * Necessário porque, quando a confirmação de e-mail está ativa, o cadastro não
 * gera sessão — logo o perfil só pode ser criado no primeiro login (ou no
 * retorno do login social).
 */
export async function ensureClientProfile(barbershopUserId: string): Promise<void> {
  if (!barbershopUserId) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('user_id', user.id)
    .eq('barbershop_user_id', barbershopUserId)
    .maybeSingle();

  if (existing) return;

  const metadata = (user.user_metadata || {}) as { full_name?: string; name?: string; phone?: string };
  const fullName = metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Cliente';
  const phone = metadata.phone || null;

  const { error } = await supabase
    .from('client_profiles')
    .insert({
      user_id: user.id,
      barbershop_user_id: barbershopUserId,
      full_name: fullName,
      phone,
    });

  if (error && error.code !== '23505') {
    console.error('Erro ao criar perfil do cliente:', error);
  }
}
