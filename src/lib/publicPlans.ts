import type { PlanConfig } from '@/types/superAdmin';

/**
 * Catálogo mínimo de contingência para os pontos públicos de aquisição.
 * O banco continua sendo a fonte principal; esta lista evita uma tela vazia
 * caso a leitura pública fique indisponível durante o cadastro.
 */
export const DEFAULT_PUBLIC_PLANS: PlanConfig[] = [
  { id: 'trial', plan_type: 'trial', display_name: 'Trial', price_monthly: 0, price_yearly: null, max_barbers: 1, max_appointments_month: 50, features: {}, is_active: true, sort_order: 0, trial_days: 14, created_at: '', updated_at: '' },
  { id: 'basic', plan_type: 'basic', display_name: 'Básico', price_monthly: 79.9, price_yearly: null, max_barbers: 3, max_appointments_month: 200, features: {}, is_active: true, sort_order: 1, trial_days: 14, created_at: '', updated_at: '' },
  { id: 'pro', plan_type: 'pro', display_name: 'Profissional', price_monthly: 149.9, price_yearly: null, max_barbers: 10, max_appointments_month: 1000, features: {}, is_active: true, sort_order: 2, trial_days: 14, created_at: '', updated_at: '' },
  { id: 'enterprise', plan_type: 'enterprise', display_name: 'Enterprise', price_monthly: 299.9, price_yearly: null, max_barbers: 50, max_appointments_month: 10000, features: {}, is_active: true, sort_order: 3, trial_days: 14, created_at: '', updated_at: '' },
];
