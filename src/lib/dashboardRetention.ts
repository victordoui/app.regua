export type VisitRecord = {
  client_id: string;
  appointment_date: string;
  status: string;
};

export type ReturnMetrics = {
  currentClients: number;
  returningClients: number;
  returnRate: number;
};

export function calculateReturnMetrics(appointments: VisitRecord[], periodStart: string): ReturnMetrics {
  const completedVisits = appointments.filter((appointment) => appointment.status === 'completed');
  const currentClients = new Set(
    completedVisits
      .filter((appointment) => appointment.appointment_date >= periodStart)
      .map((appointment) => appointment.client_id),
  );
  const priorClients = new Set(
    completedVisits
      .filter((appointment) => appointment.appointment_date < periodStart)
      .map((appointment) => appointment.client_id),
  );
  const returningClients = [...currentClients].filter((clientId) => priorClients.has(clientId)).length;

  return {
    currentClients: currentClients.size,
    returningClients,
    returnRate: currentClients.size ? Math.round((returningClients / currentClients.size) * 100) : 0,
  };
}
