export interface BarberCommissionSummary {
  barber_id: string;
  barber_name: string;
  total_commission: number;
  completed_appointments_count: number;
}

export interface CommissionDetail {
  appointment_id: string;
  client_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  service_price: number;
  commission_rate: number; // e.g., 0.40 for 40%
  commission_amount: number;
  barber_name: string;
}