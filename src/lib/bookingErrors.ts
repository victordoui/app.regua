export interface FriendlyBookingError {
  message: string;
  /** Indica que a lista de horários deve ser recarregada porque a vaga mudou. */
  refreshSlots: boolean;
}

const BOOKING_ERROR_MAP: Record<string, FriendlyBookingError> = {
  AUTH_REQUIRED: { message: 'Sua sessão expirou. Entre novamente para continuar.', refreshSlots: false },
  BUSINESS_NOT_FOUND: { message: 'Esta barbearia não está disponível para agendamentos.', refreshSlots: false },
  BUSINESS_NOT_AVAILABLE: { message: 'A página de agendamentos desta barbearia está desativada.', refreshSlots: false },
  RESPONSIBLE_REQUIRED: { message: 'Informe nome, telefone e e-mail do responsável.', refreshSlots: false },
  PARTICIPANTS_REQUIRED: { message: 'Adicione pelo menos uma pessoa ao agendamento.', refreshSlots: false },
  INVALID_PARTICIPANT: { message: 'Complete nome, profissional, serviço, data e horário de cada pessoa.', refreshSlots: false },
  INVALID_APPOINTMENT: { message: 'Complete cliente, profissional, serviço, data e horário.', refreshSlots: false },
  PROFESSIONAL_REQUIRED: { message: 'Selecione o profissional responsável pelo atendimento.', refreshSlots: false },
  CLIENT_NOT_FOUND: { message: 'O cliente selecionado não pertence a este negócio.', refreshSlots: false },
  PROFESSIONAL_NOT_AVAILABLE: { message: 'O profissional escolhido não está mais disponível. Selecione outro.', refreshSlots: true },
  INVALID_SERVICE: { message: 'Um dos serviços selecionados não está mais ativo. Revise sua escolha.', refreshSlots: false },
  OUTSIDE_BUSINESS_HOURS: { message: 'O horário escolhido está fora do funcionamento da barbearia.', refreshSlots: true },
  PROFESSIONAL_BLOCKED: { message: 'O profissional está indisponível neste horário. Escolha outro.', refreshSlots: true },
  SLOT_UNAVAILABLE: { message: 'Este horário acabou de ser ocupado. Escolha outro horário.', refreshSlots: true },
  PAST_DATETIME: { message: 'Não é possível agendar em uma data ou horário que já passou.', refreshSlots: true },
  INVALID_DATETIME: { message: 'Selecione uma data e um horário válidos.', refreshSlots: false },
  APPOINTMENT_NOT_FOUND: { message: 'Agendamento não encontrado.', refreshSlots: false },
  NOT_ALLOWED: { message: 'Você não tem permissão para alterar este agendamento.', refreshSlots: false },
  NOT_RESCHEDULABLE: { message: 'Este agendamento não pode mais ser remarcado.', refreshSlots: false },
  ALREADY_CANCELLED: { message: 'Este agendamento já estava cancelado.', refreshSlots: false },
  ALREADY_COMPLETED: { message: 'Este agendamento já foi concluído e não pode ser cancelado.', refreshSlots: false },
  CANCELLATION_DISABLED: { message: 'O cancelamento online está desativado. Entre em contato com a barbearia.', refreshSlots: false },
  TOO_LATE_TO_CANCEL: { message: 'O prazo mínimo para cancelamento online já passou. Fale com a barbearia.', refreshSlots: false },
};

/** Converte códigos de erro das funções do banco em mensagens claras em português. */
export const translateBookingError = (rawMessage?: string | null): FriendlyBookingError => {
  const text = rawMessage || '';

  for (const [code, friendly] of Object.entries(BOOKING_ERROR_MAP)) {
    if (text.includes(code)) return friendly;
  }

  if (text.includes('appointments_unique_active_slot') || text.includes('duplicate key')) {
    return { message: 'Este horário acabou de ser ocupado. Escolha outro horário.', refreshSlots: true };
  }

  if (text.includes('Failed to fetch') || text.includes('NetworkError')) {
    return { message: 'Falha de conexão. Verifique sua internet e tente novamente.', refreshSlots: false };
  }

  return { message: text || 'Não foi possível concluir a operação. Tente novamente.', refreshSlots: false };
};
