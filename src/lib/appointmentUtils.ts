interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  barbeiro_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

// ... (keep the rest of the utils, now it will use the correct types)