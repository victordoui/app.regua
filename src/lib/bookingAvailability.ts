export const intervalsOverlap = (startA: number, endA: number, startB: number, endB: number) =>
  startA < endB && endA > startB;

export const appointmentsConflict = (
  startA: number,
  durationA: number,
  startB: number,
  durationB: number,
  bufferMinutes = 0,
) => intervalsOverlap(
  startA,
  startA + durationA + bufferMinutes,
  startB,
  startB + durationB + bufferMinutes,
);

export const blockedPeriodConflict = (
  slotStart: Date,
  durationMinutes: number,
  blockStart: string,
  blockEnd: string,
) => {
  const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);
  return slotStart < new Date(blockEnd) && slotEnd > new Date(blockStart);
};
