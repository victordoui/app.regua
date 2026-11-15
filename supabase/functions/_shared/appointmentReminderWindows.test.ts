import { describe, expect, it } from "vitest";
import {
  appointmentInstant,
  dueReminderLeads,
  formatAppointmentInSaoPaulo,
} from "./appointmentReminderWindows";

describe("appointment reminder windows", () => {
  it("fires the 24-hour and 2-hour reminders only in their own final ten-minute windows", () => {
    expect(
      dueReminderLeads(
        "2026-11-16",
        "10:30:00",
        new Date("2026-11-15T10:30:00-03:00"),
      ),
    ).toEqual([24]);
    expect(
      dueReminderLeads(
        "2026-11-16",
        "10:30:00",
        new Date("2026-11-16T08:30:00-03:00"),
      ),
    ).toEqual([2]);
    expect(
      dueReminderLeads(
        "2026-11-16",
        "10:30:00",
        new Date("2026-11-16T08:40:00-03:00"),
      ),
    ).toEqual([]);
  });

  it("supports HH:mm values, rejects invalid/past appointments, and formats Brazil local time", () => {
    expect(appointmentInstant("2026-11-16", "10:30")?.toISOString()).toBe(
      "2026-11-16T13:30:00.000Z",
    );
    expect(
      dueReminderLeads(
        "invalid",
        "10:30",
        new Date("2026-11-15T10:30:00-03:00"),
      ),
    ).toEqual([]);
    expect(
      dueReminderLeads(
        "2026-11-16",
        "10:30",
        new Date("2026-11-16T10:31:00-03:00"),
      ),
    ).toEqual([]);
    expect(formatAppointmentInSaoPaulo("2026-11-16", "10:30")).toContain(
      "10:30",
    );
  });
});
