import { addMinutes, parse, format, isAfter, isBefore, isEqual } from 'date-fns';

interface Appointment {
  id: string;
  appointment_time: string;
  barbeiro_id: string | null;
  services?: {
    duration_minutes: number;
  };
}

interface BlockedSlot {
  barber_id: string;
  start_datetime: string;
  end_datetime: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  conflictReason?: string;
}

/**
 * Check if a time slot is available considering existing appointments, duration, and buffer time
 */
export const isSlotAvailable = (
  slotTime: string,
  existingAppointments: Appointment[],
  serviceDuration: number,
  bufferMinutes: number = 0,
  date: Date
): { available: boolean; reason?: string } => {
  const slotStart = parse(slotTime, 'HH:mm', date);
  const slotEnd = addMinutes(slotStart, serviceDuration);

  for (const apt of existingAppointments) {
    const aptTime = apt.appointment_time.slice(0, 5); // "HH:mm"
    const aptDuration = apt.services?.duration_minutes || 30;
    
    const aptStart = parse(aptTime, 'HH:mm', date);
    const aptEnd = addMinutes(aptStart, aptDuration + bufferMinutes);

    // Check if the new slot overlaps with existing appointment + buffer
    const overlaps = (
      (isAfter(slotStart, aptStart) || isEqual(slotStart, aptStart)) && isBefore(slotStart, aptEnd)
    ) || (
      isAfter(slotEnd, aptStart) && (isBefore(slotEnd, aptEnd) || isEqual(slotEnd, aptEnd))
    ) || (
      (isBefore(slotStart, aptStart) || isEqual(slotStart, aptStart)) && (isAfter(slotEnd, aptEnd) || isEqual(slotEnd, aptEnd))
    );

    if (overlaps) {
      return { available: false, reason: 'Horário ocupado' };
    }
  }

  return { available: true };
};

/**
 * Check if a time slot conflicts with blocked slots
 */
export const isSlotBlocked = (
  slotTime: string,
  date: Date,
  blockedSlots: BlockedSlot[],
  barberId: string,
  serviceDuration: number
): { blocked: boolean; reason?: string } => {
  const slotStart = parse(slotTime, 'HH:mm', date);
  const slotEnd = addMinutes(slotStart, serviceDuration);

  for (const block of blockedSlots) {
    if (block.barber_id !== barberId) continue;

    const blockStart = new Date(block.start_datetime);
    const blockEnd = new Date(block.end_datetime);

    // Check if slot date matches block date
    const slotDate = format(date, 'yyyy-MM-dd');
    const blockDate = format(blockStart, 'yyyy-MM-dd');
    
    if (slotDate !== blockDate) continue;

    // Convert block times to the same date context for comparison
    const blockStartTime = parse(format(blockStart, 'HH:mm'), 'HH:mm', date);
    const blockEndTime = parse(format(blockEnd, 'HH:mm'), 'HH:mm', date);

    // Check overlap
    const overlaps = (
      (isAfter(slotStart, blockStartTime) || isEqual(slotStart, blockStartTime)) && isBefore(slotStart, blockEndTime)
    ) || (
      isAfter(slotEnd, blockStartTime) && (isBefore(slotEnd, blockEndTime) || isEqual(slotEnd, blockEndTime))
    ) || (
      (isBefore(slotStart, blockStartTime) || isEqual(slotStart, blockStartTime)) && (isAfter(slotEnd, blockEndTime) || isEqual(slotEnd, blockEndTime))
    );

    if (overlaps) {
      return { blocked: true, reason: 'Horário bloqueado' };
    }
  }

  return { blocked: false };
};

/**
 * Calculate the end time of an appointment with buffer
 */
export const getEndTimeWithBuffer = (
  startTime: string,
  durationMinutes: number,
  bufferMinutes: number = 0,
  date: Date = new Date()
): string => {
  const start = parse(startTime, 'HH:mm', date);
  const end = addMinutes(start, durationMinutes + bufferMinutes);
  return format(end, 'HH:mm');
};

/**
 * Generate available time slots for a day
 */
export const generateTimeSlots = (
  date: Date,
  startHour: number,
  endHour: number,
  intervalMinutes: number,
  existingAppointments: Appointment[],
  blockedSlots: BlockedSlot[],
  barberId: string,
  serviceDuration: number,
  bufferMinutes: number = 0
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check for blocked slots
      const { blocked, reason: blockReason } = isSlotBlocked(
        timeStr,
        date,
        blockedSlots,
        barberId,
        serviceDuration
      );

      if (blocked) {
        slots.push({ time: timeStr, available: false, conflictReason: blockReason });
        continue;
      }

      // Check for existing appointments
      const { available, reason } = isSlotAvailable(
        timeStr,
        existingAppointments.filter(apt => apt.barbeiro_id === barberId),
        serviceDuration,
        bufferMinutes,
        date
      );

      slots.push({ time: timeStr, available, conflictReason: reason });
    }
  }

  return slots;
};

/**
 * Calculate total duration of multiple services
 */
export const calculateTotalDuration = (
  serviceIds: string[],
  services: { id: string; duration_minutes: number }[]
): number => {
  return services
    .filter(s => serviceIds.includes(s.id))
    .reduce((sum, s) => sum + s.duration_minutes, 0);
};

/**
 * Calculate total price of multiple services
 */
export const calculateTotalPrice = (
  serviceIds: string[],
  services: { id: string; price: number }[]
): number => {
  return services
    .filter(s => serviceIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);
};
