import { describe, expect, it } from 'vitest';
import {
  buildGroupBookingNotes,
  getAppointmentAttendeeName,
  getVisibleAppointmentNotes,
  parseGroupBookingNotes,
} from './groupBooking';

describe('groupBooking metadata', () => {
  it('preserves group, attendee, relationship and responsible metadata', () => {
    const notes = buildGroupBookingNotes({
      groupId: 'group-123',
      attendeeName: 'Benicio',
      relationship: 'Filho(a)',
      responsibleName: 'Victor',
      notes: 'Primeiro atendimento',
    });

    expect(parseGroupBookingNotes(notes)).toEqual({
      groupId: 'group-123',
      attendeeName: 'Benicio',
      relationship: 'Filho(a)',
      responsibleName: 'Victor',
    });
    expect(getVisibleAppointmentNotes(notes)).toBe('Primeiro atendimento');
  });

  it('uses attendee metadata before the commercial client name', () => {
    const notes = buildGroupBookingNotes({
      groupId: 'group-456',
      attendeeName: 'Maria',
      relationship: 'Esposa(o)',
      responsibleName: 'Victor',
    });

    expect(getAppointmentAttendeeName({
      notes,
      clients: { id: 'client-1', name: 'Victor', phone: '21999999999' },
    })).toBe('Maria');
  });

  it('falls back to the commercial client name for ordinary bookings', () => {
    expect(getAppointmentAttendeeName({
      notes: 'Cliente prefere atendimento silencioso',
      clients: { id: 'client-1', name: 'Victor', phone: '21999999999' },
    })).toBe('Victor');
    expect(getVisibleAppointmentNotes('Cliente prefere atendimento silencioso'))
      .toBe('Cliente prefere atendimento silencioso');
  });

  it('returns empty metadata for missing notes', () => {
    expect(parseGroupBookingNotes()).toEqual({
      groupId: null,
      attendeeName: null,
      relationship: null,
      responsibleName: null,
    });
  });
});
