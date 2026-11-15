import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from './SignupPage';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ order: async () => ({ data: null, error: { message: 'Synthetic offline catalog' } }) }),
      }),
    }),
  },
}));

afterEach(cleanup);

describe('SignupPage accessibility semantics', () => {
  it('provides one main landmark and one page heading', async () => {
    render(<MemoryRouter><SignupPage /></MemoryRouter>);

    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
