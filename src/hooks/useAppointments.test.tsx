import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppointments } from './useAppointments';

const mocks = vi.hoisted(() => ({
  selectCalls: [] as Array<{ table: string; columns?: string }>,
  from: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'owner-1' } }),
}));

vi.mock('@/contexts/RoleContext', () => ({
  useRole: () => ({ businessId: 'owner-1' }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mocks.from,
    channel: () => ({
      on() { return this; },
      subscribe() { return this; },
    }),
    removeChannel: vi.fn(),
  },
}));

const tableRows: Record<string, unknown[]> = {
  appointments: [{
    id: 'appointment-1',
    user_id: 'owner-1',
    client_id: 'client-1',
    service_id: 'service-1',
    barbeiro_id: 'barber-1',
    appointment_date: '2026-07-28',
    appointment_time: '09:00:00',
    status: 'pending',
    notes: null,
    total_price: 50,
    created_at: '2026-07-28T12:00:00Z',
    updated_at: '2026-07-28T12:00:00Z',
  }],
  appointment_services: [
    { id: 'link-1', appointment_id: 'appointment-1', service_id: 'service-1', price: 50, created_at: null },
    { id: 'link-2', appointment_id: 'appointment-1', service_id: 'service-2', price: 30, created_at: null },
  ],
  clients: [{ id: 'client-1', name: 'Victor', email: 'victor@example.com', phone: '21999999999' }],
  services: [
    { id: 'service-1', name: 'Corte', description: '', price: 50, duration_minutes: 30, active: true },
    { id: 'service-2', name: 'Barba', description: '', price: 30, duration_minutes: 20, active: true },
  ],
  profiles: [{ id: 'barber-1', user_id: 'owner-1', full_name: 'Rafael', email: 'rafael@example.com', phone: null, role: 'barbeiro', active: true }],
};

const createQuery = (table: string) => {
  const query: Record<string, unknown> = {};
  for (const method of ['eq', 'neq', 'in', 'or', 'order', 'gte', 'lte', 'not']) {
    query[method] = vi.fn(() => query);
  }
  query.select = vi.fn((columns?: string) => {
    mocks.selectCalls.push({ table, columns });
    return query;
  });
  query.then = (resolve: (value: unknown) => unknown) =>
    Promise.resolve({ data: tableRows[table] || [], error: null }).then(resolve);
  return query;
};

describe('useAppointments', () => {
  beforeEach(() => {
    mocks.selectCalls.length = 0;
    mocks.from.mockImplementation((table: string) => createQuery(table));
  });

  it('carrega a agenda sem depender de relacionamentos PostgREST inexistentes', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useAppointments(), { wrapper });

    const appointments = await result.current.fetchAppointments();

    expect(appointments).toHaveLength(1);
    expect(appointments[0].clients?.name).toBe('Victor');
    expect(appointments[0].services?.name).toBe('Corte + Barba');
    expect(appointments[0].services?.duration_minutes).toBe(50);
    expect(appointments[0].appointment_services).toHaveLength(2);
    expect(appointments[0].barbers?.full_name).toBe('Rafael');

    const appointmentSelect = mocks.selectCalls.find(call => call.table === 'appointments');
    expect(appointmentSelect?.columns).toBe('*');
    expect(mocks.selectCalls.some(call => call.columns?.includes('clients:profiles'))).toBe(false);
    expect(mocks.selectCalls.some(call => call.columns?.includes('barbers:profiles'))).toBe(false);
  });
});
