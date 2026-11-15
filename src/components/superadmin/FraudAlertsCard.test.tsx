import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FraudAlertsCard from './FraudAlertsCard';

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  runAction: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: mocks.invoke } },
}));

vi.mock('@/hooks/superadmin/usePlatformUserActions', () => ({
  usePlatformUserActions: () => ({ runAction: mocks.runAction, isUpdating: false }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mocks.toast }),
}));

const alertResponse = {
  alerts: [{
    id: 'duplicate_email:test',
    type: 'duplicate_email',
    title: 'E-mail repetido',
    description: '2 contas compartilham um identificador. Revise antes de tomar qualquer ação.',
    severity: 'medium' as const,
    users: [{
      user_id: 'qa-owner-id',
      name: 'QA Empresa',
      email: 'qa-owner@example.test',
      company_name: 'QA Empresa',
      subscription_id: 'qa-subscription-id',
    }],
  }],
  signal_coverage: { signup_signals: 2, ip_signals: 0, device_signals: 0 },
};

function renderCard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <FraudAlertsCard />
    </QueryClientProvider>,
  );
}

describe('FraudAlertsCard', () => {
  beforeEach(() => {
    mocks.invoke.mockReset().mockResolvedValue({ data: alertResponse, error: null });
    mocks.runAction.mockReset().mockResolvedValue({ action: 'suspend' });
    mocks.toast.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows the alert and only suspends after the operator confirms', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderCard();

    expect(await screen.findByText('E-mail repetido')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Suspender' }));

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('QA Empresa'));
    await waitFor(() => {
      expect(mocks.runAction).toHaveBeenCalledWith({ action: 'suspend', targetUserId: 'qa-owner-id' });
    });
  });

  it('does not change access when the operator cancels the confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderCard();

    expect(await screen.findByText('E-mail repetido')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Suspender' }));

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(mocks.runAction).not.toHaveBeenCalled();
  });
});
