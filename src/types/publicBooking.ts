import { Service, Barber, TimeSlot } from './booking';

export interface Branch {
  id: string;
  name: string;
  address: string;
  working_hours: string;
}

export interface ClientBookingForm {
  step: number;
  selectedBranch: string;
  selectedBarber: string;
  selectedServices: string[]; // IDs dos serviços
  selectedDate: Date | undefined;
  selectedTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
}

export const PUBLIC_STEPS = [
  { id: 1, name: "Upgrade/Paywall" }, // Novo Passo 1
  { id: 2, name: "Filial" },
  { id: 3, name: "Profissional" },
  { id: 4, name: "Serviços" },
  { id: 5, name: "Horário" },
  { id: 6, name: "Confirmação" },
];

// Reutilizando tipos de booking.ts
export type PublicService = Service;
export type PublicBarber = Barber;
export type PublicTimeSlot = TimeSlot;