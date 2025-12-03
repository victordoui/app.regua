export interface Client {
  id: string;
  name: string; // Mapeado de display_name ou first_name/last_name
  phone: string;
  email?: string;
  notes?: string;
  created_at?: string;
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
  id: string; // ID do perfil do barbeiro
  user_id: string; // ID do usuário auth.users
  full_name: string; // Nome completo do barbeiro
  email: string;
  phone?: string;
  role?: "admin" | "barbeiro" | "cliente";
  active?: boolean;
  specialties?: string[];
  specializations?: string[];
}

export type BarberData = Barber; // Mantendo para compatibilidade, mas Barber é mais descritivo

export interface TimeSlot {
  time: string;
  available: boolean;
  barberId?: string;
  conflictReason?: string;
}

export type RecurrenceType = 'weekly' | 'biweekly' | 'monthly' | null;

export interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  barbeiro_id: string | null;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  total_price?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string | null;
  parent_appointment_id?: string | null;
  reminder_sent_at?: string | null;
  clients?: Client; // Populated via join
  services?: Service; // Populated via join
  barbers?: Barber; // Populated via join (assuming 'barbers' is the alias for the joined profile)
}

export interface AppointmentFormData {
  client_id: string;
  service_id: string;
  barbeiro_id: string | null; // Pode ser nulo se o cliente não escolher um barbeiro específico
  appointment_date: string;
  appointment_time: string;
  notes: string;
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string | null;
}
