export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  active: boolean;
}

export interface Barber {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role?: "admin" | "barbeiro" | "cliente";
}

export type BarberData = Barber;

export interface TimeSlot {
  time: string;
  available: boolean;
  barberId?: string;
  conflictReason?: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  barbeiro_id: string | null;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
  total_price?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  clients?: Client;
  services?: Service;
}

export interface AppointmentFormData {
  client_id: string;
  service_id: string;
  barbeiro_id: string;
  appointment_date: string;
  appointment_time: string;
  notes: string;
}