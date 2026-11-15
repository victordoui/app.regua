import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ signIn: vi.fn() }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

afterEach(cleanup);
afterAll(() => vi.unstubAllGlobals());

let LoginPage: ComponentType;
beforeAll(async () => {
  vi.stubGlobal('__VIZZU_TEST_LOGIN_PASSWORD__', '');
  vi.stubGlobal('__VIZZU_TEST_LOGIN_ENABLED__', false);
  LoginPage = (await import('./Login')).default;
}, 30_000);

describe('Login accessibility semantics', () => {
  it('provides one main landmark and one page heading', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('associates email and current-password labels with accessible autocomplete fields', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    const email = screen.getByLabelText('E-mail');
    const password = screen.getByLabelText('Senha');
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
  });
});
