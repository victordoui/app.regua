import { addMinutes, parse, format, isAfter, isBefore, isEqual, getDay } from 'date-fns';

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

interface BarberShift {
  id: string;
  barber_id: string;
  day_of_week: number | null;
  specific_date: string | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  break_start: string | null;
  break_end: string | null;
  status: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  conflictReason?: string;
}

/**
 * Get the shift for a barber on a specific date
 */
export const getShiftForDate = (
  barberId: string,
  date: Date,
  shifts: BarberShift[]
): BarberShift | null => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayOfWeek = getDay(date);

  // Filter shifts for this barber that are active
  const barberShifts = shifts.filter(
    s => s.barber_id === barberId && s.status === 'active'
  );

  // First check for specific date exception
  const specificShift = barberShifts.find(
    s => !s.is_recurring && s.specific_date === dateStr
  );
  if (specificShift) return specificShift;

  // Then check for recurring shift
  const recurringShift = barberShifts.find(
    s => s.is_recurring && s.day_of_week === dayOfWeek
  );
  return recurringShift || null;
};

/**
 * Check if a time slot is within a barber's shift (considering duration)
 */
export const isSlotWithinShift = (
  slotTime: string,
  date: Date,
  barberId: string,
  shifts: BarberShift[],
  serviceDuration: number
): { withinShift: boolean; reason?: string } => {
  const shift = getShiftForDate(barberId, date, shifts);
  
  if (!shift) {
    return { withinShift: false, reason: 'Barbeiro não trabalha neste dia' };
  }

  const slotStart = parse(slotTime, 'HH:mm', date);
  const slotEnd = addMinutes(slotStart, serviceDuration);
  const shiftStart = parse(shift.start_time.substring(0, 5), 'HH:mm', date);
  const shiftEnd = parse(shift.end_time.substring(0, 5), 'HH:mm', date);

  // Check if slot starts before shift
  if (isBefore(slotStart, shiftStart)) {
    return { withinShift: false, reason: 'Antes do início do turno' };
  }

  // Check if slot ends after shift
  if (isAfter(slotEnd, shiftEnd)) {
    return { withinShift: false, reason: 'Após o fim do turno' };
  }

  // Check if slot overlaps with break
  if (shift.break_start && shift.break_end) {
    const breakStart = parse(shift.break_start.substring(0, 5), 'HH:mm', date);
    const breakEnd = parse(shift.break_end.substring(0, 5), 'HH:mm', date);

    // Check if any part of the slot overlaps with break
    const overlapsBreak = (
      (isAfter(slotStart, breakStart) || isEqual(slotStart, breakStart)) && isBefore(slotStart, breakEnd)
    ) || (
      isAfter(slotEnd, breakStart) && (isBefore(slotEnd, breakEnd) || isEqual(slotEnd, breakEnd))
    ) || (
      (isBefore(slotStart, breakStart) || isEqual(slotStart, breakStart)) && (isAfter(slotEnd, breakEnd) || isEqual(slotEnd, breakEnd))
    );
    
    if (overlapsBreak) {
      return { withinShift: false, reason: 'Durante intervalo' };
    }
  }

  return { withinShift: true };
};

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
 * Generate available time slots for a day considering shifts
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
  bufferMinutes: number = 0,
  barberShifts: BarberShift[] = []
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  // Check if barber has any shifts configured
  const hasShifts = barberShifts.some(s => s.barber_id === barberId && s.status === 'active');
  
  // Get shift for this specific date
  const shift = hasShifts ? getShiftForDate(barberId, date, barberShifts) : null;

  // If barber has shifts configured but no shift for this date, they're not working
  if (hasShifts && !shift) {
    // Return empty slots with message - this date has no availability
    return [];
  }

  // Determine the hours to generate slots for
  let effectiveStartHour = startHour;
  let effectiveEndHour = endHour;

  if (shift) {
    // Use shift hours if available
    const shiftStartParts = shift.start_time.substring(0, 5).split(':');
    const shiftEndParts = shift.end_time.substring(0, 5).split(':');
    effectiveStartHour = parseInt(shiftStartParts[0], 10);
    effectiveEndHour = parseInt(shiftEndParts[0], 10);
    
    // If end has minutes > 0, include that hour
    if (parseInt(shiftEndParts[1], 10) > 0) {
      effectiveEndHour += 1;
    }
  }

  for (let hour = effectiveStartHour; hour < effectiveEndHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // If shifts are configured, check if slot is within shift
      if (hasShifts && shift) {
        const { withinShift, reason: shiftReason } = isSlotWithinShift(
          timeStr,
          date,
          barberId,
          barberShifts,
          serviceDuration
        );

        if (!withinShift) {
          slots.push({ time: timeStr, available: false, conflictReason: shiftReason });
          continue;
        }
      }

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
