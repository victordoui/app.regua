import { describe, expect, it } from "vitest";
import { translateBookingError } from "./bookingErrors";
import { appointmentsConflict, minutesFromTime } from "./bookingAvailability";

describe("translateBookingError", () => {
  it("traduz códigos vindos das funções do banco", () => {
    const result = translateBookingError('erro: SLOT_UNAVAILABLE');
    expect(result.message).toContain("acabou de ser ocupado");
    expect(result.refreshSlots).toBe(true);
  });

  it("traduz violação do índice único de horário", () => {
    const result = translateBookingError(
      'duplicate key value violates unique constraint "appointments_unique_active_slot"',
    );
    expect(result.refreshSlots).toBe(true);
    expect(result.message).toContain("ocupado");
  });

  it("traduz falha de conexão", () => {
    expect(translateBookingError("TypeError: Failed to fetch").message).toContain("conexão");
  });

  it("respeita o prazo de cancelamento", () => {
    expect(translateBookingError("TOO_LATE_TO_CANCEL").message).toContain("prazo mínimo");
  });
});

describe("minutesFromTime", () => {
  it("aceita HH:MM e HH:MM:SS", () => {
    expect(minutesFromTime("09:30")).toBe(570);
    expect(minutesFromTime("09:30:00")).toBe(570);
    expect(minutesFromTime("00:00")).toBe(0);
  });

  it("detecta sobreposição considerando duração e buffer", () => {
    // 09:00 por 30min vs 09:20 por 30min => conflito
    expect(appointmentsConflict(540, 30, 560, 30)).toBe(true);
    // 09:00 por 30min vs 09:30 sem buffer => livre
    expect(appointmentsConflict(540, 30, 570, 30)).toBe(false);
    // mesmo caso com buffer de 10min => conflito
    expect(appointmentsConflict(540, 30, 570, 30, 10)).toBe(true);
  });
});
