import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CalendarView from './CalendarView';
import type { Appointment } from '@/types/appointments';

vi.mock('@/hooks/use-mobile', () => ({
    useIsMobile: () => false,
}));

const appointment: Appointment = {
    id: 'appointment-1',
    client_id: 'client-1',
    service_id: 'service-1',
    barbeiro_id: 'barber-1',
    appointment_date: '2026-07-28',
    appointment_time: '09:30:00',
    status: 'pending',
    notes: '',
    total_price: 50,
    user_id: 'company-1',
    created_at: '2026-07-28T10:00:00-03:00',
    updated_at: '2026-07-28T10:00:00-03:00',
    clients: {
        id: 'client-1',
        name: 'Victor Cliente',
        phone: '21999999999',
    },
    services: {
        id: 'service-1',
        name: 'Corte de cabelo',
        description: '',
        price: 50,
        duration_minutes: 30,
        active: true,
    },
};

describe('CalendarView', () => {
    it('renderiza no dia correto o cartão criado pela página do cliente', () => {
        render(
            <CalendarView
                appointments={[appointment]}
                selectedDate={new Date(2026, 6, 28, 12)}
                onDateChange={vi.fn()}
                onTimeSlotClick={vi.fn()}
                onEventClick={vi.fn()}
                viewMode="week"
                barberColorMap={new Map([['barber-1', '#2563eb']])}
            />,
        );

        expect(screen.getByText('Victor Cliente')).toBeTruthy();
        expect(screen.getByText('Corte de cabelo')).toBeTruthy();
    });
});
