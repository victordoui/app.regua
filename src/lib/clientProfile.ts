import { supabase } from '@/integrations/supabase/client';

/**
 * Garante que o cliente autenticado tenha um perfil vinculado à barbearia atual.
 *
 * Também conclui o perfil no retorno do login social, usando o telefone
 * informado imediatamente antes do redirecionamento para o provedor.
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

  const pendingKey = `client-contact:${barbershopUserId}`;
  const pendingRaw = sessionStorage.getItem(pendingKey);
  let pending: { fullName?: string | null; phone?: string | null } = {};
  try { pending = pendingRaw ? JSON.parse(pendingRaw) : {}; } catch { pending = {}; }

  if (existing) {
    sessionStorage.removeItem(pendingKey);
    return;
  }

  const metadata = (user.user_metadata || {}) as { full_name?: string; name?: string; phone?: string };
  const fullName = pending.fullName || metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Cliente';
  const phone = pending.phone || metadata.phone || null;

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
    return;
  }

  sessionStorage.removeItem(pendingKey);
}
