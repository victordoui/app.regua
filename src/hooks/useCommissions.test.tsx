import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren } from 'react';
import { useCommissions } from './useCommissions';
import { resolveCommissionRate } from '@/lib/commissionCalculation';

const state = vi.hoisted(() => ({ value: 50, type: 'percentage', queryError: false, filters: [] as string[] }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'owner' } }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/hooks/useCommissionRules', () => ({ useCommissionRules: () => ({ isLoading: false, error: null, getCommissionRate: (barber: string, service: string) => resolveCommissionRate([{ barber_id: 'barber', service_id: 'service', commission_type: state.type, commission_value: state.value }], barber, service) }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  from: (table: string) => {
    const query = {
      select() { return query; },
      eq(field: string, value: string) { state.filters.push(`${table}.${field}=${value}`); return query; },
      gte() { return query; }, lte() { return query; },
      then(resolve: (value: unknown) => unknown) {
        return Promise.resolve({ error: state.queryError ? new Error('offline') : null, data: table === 'appointments' ? [{ id: 'appointment', service_id: 'service', barbeiro_id: 'barber', total_price: 80, appointment_date: '2026-10-01', appointment_time: '10:00', services: { name: 'Corte', price: 100 }, clients: { name: 'Cliente' }, barber_profile: { display_name: 'Profissional' } }] : [] }).then(resolve);
      },
    };
    return query;
  },
} }));

afterEach(cleanup);
beforeEach(() => { state.value = 50; state.type = 'percentage'; state.queryError = false; state.filters = []; });
const createWrapper = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('Commission summary integration', () => {
  it('uses the rule and persisted appointment amount, not today’s service price', async () => {
    const { result } = renderHook(useCommissions, { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.calculatedCommissions.totalOverallCommission).toBe(40));
    expect(result.current.calculatedCommissions.commissionDetails[0].commission_rate).toBe(0.5);
    expect(state.filters).toContain('profiles.user_id=owner');
    expect(state.filters).toContain('appointments.user_id=owner');
    expect(state.filters).toContain('appointments.status=completed');
  });
  it('supports a fixed-value rule in the actual summary', async () => {
    state.type = 'fixed'; state.value = 15;
    const { result } = renderHook(useCommissions, { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.calculatedCommissions.totalOverallCommission).toBe(15));
    expect(result.current.calculatedCommissions.commissionDetails[0].commission_type).toBe('fixed');
  });
  it('reports invalid rules without displaying a partial total', async () => {
    state.value = -10;
    const { result } = renderHook(useCommissions, { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.calculatedCommissions.barberSummaries).toEqual([]);
  });
  it('reports query failure instead of treating it as no commissions', async () => {
    state.queryError = true;
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(useCommissions, { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.error).toBeTruthy());
    log.mockRestore();
  });
});
