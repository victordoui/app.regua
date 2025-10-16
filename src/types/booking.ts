import { User, Scissors, Clock, CheckCircle } from "lucide-react";

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  active?: boolean;
}

export interface Barber {
  id: string;
  name: string;
  specialties?: string[];
  avatar?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  barberId?: string;
  conflictReason?: string;
}

export interface UserSubscription {
  id: string;
  plan_name: string;
  status: string;
  credits_remaining: number;
  end_date: string;
  discount_percentage: number;
}

export interface BookingForm {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  selectedService: string;
  selectedBarber: string;
  notes: string;
}

export const STEPS = [
  { id: 1, name: "Serviço", icon: Scissors },
  { id: 2, name: "Barbeiro", icon: User },
  { id: 3, name: "Data e Horário", icon: Clock },
  { id: 4, name: "Confirmação", icon: CheckCircle },
];