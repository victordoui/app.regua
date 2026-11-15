import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'vizzu-support-impersonation';

export interface SupportImpersonationState {
  originalSession: Session;
  targetUserId: string;
  companyName: string;
  startedAt: string;
}

export const readSupportImpersonation = (): SupportImpersonationState | null => {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as SupportImpersonationState : null;
  } catch {
    return null;
  }
};

export const startSupportImpersonation = async (targetUserId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Sua sessão expirou. Entre novamente no VIZZU.');

  const { data, error } = await supabase.functions.invoke('platform-impersonation', {
    body: { action: 'start', target_user_id: targetUserId },
  });
  if (error) throw error;
  if (!data?.token_hash || !data?.company_name) throw new Error('Não foi possível iniciar o acesso de suporte.');

  const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: 'magiclink' });
  if (verifyError) throw verifyError;

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    originalSession: session,
    targetUserId,
    companyName: data.company_name,
    startedAt: new Date().toISOString(),
  } satisfies SupportImpersonationState));
  return data.company_name as string;
};

export const endSupportImpersonation = async () => {
  const state = readSupportImpersonation();
  if (!state?.originalSession?.access_token || !state.originalSession.refresh_token) {
    throw new Error('Não foi possível restaurar a sessão do Super Admin. Entre novamente.');
  }

  await supabase.auth.signOut();
  const { error: restoreError } = await supabase.auth.setSession({
    access_token: state.originalSession.access_token,
    refresh_token: state.originalSession.refresh_token,
  });
  if (restoreError) throw restoreError;

  const { error: auditError } = await supabase.functions.invoke('platform-impersonation', {
    body: { action: 'end', target_user_id: state.targetUserId },
    headers: { Authorization: `Bearer ${state.originalSession.access_token}` },
  });
  sessionStorage.removeItem(STORAGE_KEY);
  return { auditRecorded: !auditError };
};
