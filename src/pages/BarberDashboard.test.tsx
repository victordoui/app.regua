import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BarberDashboard from './BarberDashboard';
import { addBusinessCalendarDays, formatBusinessDateInput } from '@/lib/formatters';

const mocks = vi.hoisted(() => ({
  dashboard: vi.fn(),
  role: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('@/hooks/useProfessionalDashboard', () => ({ useProfessionalDashboard: mocks.dashboard }));
vi.mock('@/contexts/RoleContext', () => ({ useRole: mocks.role }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/components/Layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

afterEach(cleanup);

describe('BarberDashboard', () => {
  beforeEach(() => {
    const today = formatBusinessDateInput();
    const tomorrow = addBusinessCalendarDays(today, 1);
    mocks.role.mockReturnValue({ teamProfileId: 'qa-profile', loading: false });
    mocks.dashboard.mockReturnValue({
      data: {
        professionalName: 'QA Profissional',
        todayAppointments: [{ id: 'today', appointment_date: today, appointment_time: '09:00:00', status: 'confirmed', service_id: 'today-service', total_price: 80, tip_amount: null }],
        upcomingAppointments: [{ id: 'future', appointment_date: tomorrow, appointment_time: '10:30:00', status: 'confirmed', service_id: 'future-service', total_price: 120, tip_amount: null }],
        servicesById: new Map([
          ['today-service', { id: 'today-service', name: 'QA Atendimento de hoje', price: 80, duration_minutes: 30 }],
          ['future-service', { id: 'future-service', name: 'QA Atendimento futuro', price: 120, duration_minutes: 45 }],
        ]),
        monthlyRevenue: 120,
        monthlyTips: 12.5,
        completedCount: 1,
        averageTicket: 120,
        occupancy: 0.1,
        noShows: 1,
        pendingCommission: 24,
        paidCommission: 40,
        topServices: [{ id: 'future-service', name: 'QA Serviço em destaque', count: 1, revenue: 120 }],
        monthlyGoal: null,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      saveGoal: { mutateAsync: vi.fn(), isPending: false },
    });
  });

  it('renders future appointments and the professional metrics in Portuguese formats', () => {
    render(<MemoryRouter><BarberDashboard /></MemoryRouter>);

    const upcomingHeading = screen.getByRole('heading', { name: 'Próximos horários' });
    const upcomingCard = upcomingHeading.closest('div')?.parentElement?.parentElement;
    expect(upcomingCard).toBeTruthy();
    expect(within(upcomingCard as HTMLElement).getByText('QA Atendimento futuro')).toBeInTheDocument();
    expect(screen.getByText('0,1%')).toBeInTheDocument();
    expect(screen.getByText('R$ 12,50')).toBeInTheDocument();
    expect(screen.getByText('R$ 24,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 40,00')).toBeInTheDocument();
  });
});
