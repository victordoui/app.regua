import type { Appointment } from '@/types/appointments';

const GROUP_PATTERN = /^\[GRUPO:([^\]]+)]$/m;
const ATTENDEE_PATTERN = /^Atendimento para:\s*(.+)$/m;
const RELATION_PATTERN = /^Relação:\s*(.+)$/m;
const RESPONSIBLE_PATTERN = /^Responsável:\s*(.+)$/m;

export interface GroupBookingMetadata {
  groupId: string | null;
  attendeeName: string | null;
  relationship: string | null;
  responsibleName: string | null;
}

export const parseGroupBookingNotes = (notes?: string | null): GroupBookingMetadata => ({
  groupId: notes?.match(GROUP_PATTERN)?.[1]?.trim() || null,
  attendeeName: notes?.match(ATTENDEE_PATTERN)?.[1]?.trim() || null,
  relationship: notes?.match(RELATION_PATTERN)?.[1]?.trim() || null,
  responsibleName: notes?.match(RESPONSIBLE_PATTERN)?.[1]?.trim() || null,
});

export const buildGroupBookingNotes = ({
  groupId,
  attendeeName,
  relationship,
  responsibleName,
  notes,
}: {
  groupId: string;
  attendeeName: string;
  relationship: string;
  responsibleName: string;
  notes?: string;
}) => [
  `[GRUPO:${groupId}]`,
  `Atendimento para: ${attendeeName.trim()}`,
  `Relação: ${relationship}`,
  `Responsável: ${responsibleName.trim()}`,
  notes?.trim() ? `Observações: ${notes.trim()}` : null,
].filter(Boolean).join('\n');

export const getAppointmentAttendeeName = (appointment: Pick<Appointment, 'notes' | 'clients'>) =>
  parseGroupBookingNotes(appointment.notes).attendeeName || appointment.clients?.name || 'Cliente';

export const getVisibleAppointmentNotes = (notes?: string | null) => {
  if (!notes) return '';
  const observation = notes.match(/^Observações:\s*([\s\S]+)$/m)?.[1]?.trim();
  return observation || (GROUP_PATTERN.test(notes) ? '' : notes);
};
