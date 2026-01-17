import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, Save } from "lucide-react";
import { useBusinessHours, BusinessHour } from "@/hooks/useBusinessHours";

interface DaySchedule {
  day: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DAY_NAMES_PT = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const BusinessHoursEditor = () => {
  const { businessHours, isLoading, upsertBusinessHour, isUpdating, initializeBusinessHours, isInitializing } = useBusinessHours();
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (businessHours && businessHours.length > 0) {
      const mappedSchedule = DAY_NAMES_PT.map((name, index) => {
        const existing = businessHours.find((h: BusinessHour) => h.day_of_week === index);
        return {
          day: index,
          dayName: name,
          isOpen: existing ? !existing.is_closed : index >= 1 && index <= 6,
          openTime: existing?.open_time || "09:00",
          closeTime: existing?.close_time || "19:00",
        };
      });
      setSchedule(mappedSchedule);
    } else {
      // Default schedule
      const defaultSchedule = DAY_NAMES_PT.map((name, index) => ({
        day: index,
        dayName: name,
        isOpen: index >= 1 && index <= 6, // Mon-Sat open by default
        openTime: "09:00",
        closeTime: "19:00",
      }));
      setSchedule(defaultSchedule);
    }
  }, [businessHours]);

  const handleToggleDay = (dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((d) => (d.day === dayIndex ? { ...d, isOpen: !d.isOpen } : d))
    );
    setHasChanges(true);
  };

  const handleTimeChange = (dayIndex: number, field: "openTime" | "closeTime", value: string) => {
    setSchedule((prev) =>
      prev.map((d) => (d.day === dayIndex ? { ...d, [field]: value } : d))
    );
    setHasChanges(true);
  };

  const isSaving = isUpdating || isInitializing;

  const handleSave = async () => {
    for (const day of schedule) {
      await upsertBusinessHour({
        day_of_week: day.day,
        open_time: day.openTime,
        close_time: day.closeTime,
        is_closed: !day.isOpen,
      });
    }
    setHasChanges(false);
  };

  const handleInitialize = async () => {
    await initializeBusinessHours();
  };

  if (isLoading || isSaving) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Horário de Funcionamento
        </CardTitle>
        <CardDescription>
          Configure os horários de abertura e fechamento para cada dia da semana
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Nenhum horário configurado ainda.
            </p>
            <Button onClick={handleInitialize} disabled={isSaving}>
              Inicializar Horários Padrão
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {schedule.map((day) => (
                <div
                  key={day.day}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    day.isOpen ? "bg-card" : "bg-muted/50"
                  }`}
                >
                  <div className="w-32 flex items-center gap-2">
                    <Switch
                      checked={day.isOpen}
                      onCheckedChange={() => handleToggleDay(day.day)}
                    />
                    <Label className={`text-sm font-medium ${!day.isOpen && "text-muted-foreground"}`}>
                      {day.dayName}
                    </Label>
                  </div>

                  {day.isOpen ? (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Abre:</Label>
                        <Input
                          type="time"
                          value={day.openTime}
                          onChange={(e) => handleTimeChange(day.day, "openTime", e.target.value)}
                          className="w-28"
                        />
                      </div>
                      <span className="text-muted-foreground">até</span>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Fecha:</Label>
                        <Input
                          type="time"
                          value={day.closeTime}
                          onChange={(e) => handleTimeChange(day.day, "closeTime", e.target.value)}
                          className="w-28"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">
                      Fechado
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Salvando..." : "Salvar Horários"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
