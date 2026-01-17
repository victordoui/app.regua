import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Plus, Check, Info } from 'lucide-react';

interface Barber {
  id: string;
  name: string;
}

interface Shift {
  id?: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface OnboardingStepShiftsProps {
  barbers: Barber[];
  shifts: Shift[];
  onCreateShift: (shift: { barber_id: string; day_of_week: number; start_time: string; end_time: string; is_recurring: boolean }) => Promise<void>;
  isLoading?: boolean;
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const OnboardingStepShifts: React.FC<OnboardingStepShiftsProps> = ({
  barbers,
  shifts,
  onCreateShift,
  isLoading,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    barber_id: '',
    day_of_week: '1',
    start_time: '09:00',
    end_time: '19:00',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.barber_id) return;

    await onCreateShift({
      barber_id: formData.barber_id,
      day_of_week: parseInt(formData.day_of_week),
      start_time: formData.start_time,
      end_time: formData.end_time,
      is_recurring: true,
    });

    setFormData({
      barber_id: formData.barber_id, // Keep barber selected for quick multi-day add
      day_of_week: '1',
      start_time: '09:00',
      end_time: '19:00',
    });
  };

  const handleQuickSetup = async (barberId: string) => {
    // Add shifts for weekdays (Mon-Sat)
    for (let day = 1; day <= 6; day++) {
      const existingShift = shifts.find(s => s.barber_id === barberId && s.day_of_week === day);
      if (!existingShift) {
        await onCreateShift({
          barber_id: barberId,
          day_of_week: day,
          start_time: day === 6 ? '09:00' : '09:00',
          end_time: day === 6 ? '17:00' : '19:00',
          is_recurring: true,
        });
      }
    }
  };

  const getBarberShifts = (barberId: string) => {
    return shifts.filter(s => s.barber_id === barberId);
  };

  const getBarberName = (barberId: string) => {
    return barbers.find(b => b.id === barberId)?.name || 'Barbeiro';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <CalendarClock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Turnos de Trabalho</CardTitle>
          <CardDescription>
            Configure a escala semanal dos barbeiros (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Info box */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-muted">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Este passo é opcional</p>
              <p>
                Você pode configurar os turnos depois na área de gestão. 
                Os turnos definem quando cada barbeiro está disponível para atendimento.
              </p>
            </div>
          </div>

          {/* Quick setup buttons */}
          {barbers.length > 0 && (
            <div className="space-y-3">
              <Label>Configuração rápida</Label>
              <div className="flex flex-wrap gap-2">
                {barbers.map((barber) => {
                  const barberShifts = getBarberShifts(barber.id);
                  const hasShifts = barberShifts.length > 0;

                  return (
                    <Button
                      key={barber.id}
                      variant={hasShifts ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => !hasShifts && handleQuickSetup(barber.id)}
                      disabled={hasShifts || isLoading}
                      className="gap-1"
                    >
                      {hasShifts ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      {barber.name}
                      {hasShifts && <span className="text-xs">({barberShifts.length} dias)</span>}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Clique para adicionar horário padrão (Seg-Sáb)
              </p>
            </div>
          )}

          {/* Shifts summary */}
          {shifts.length > 0 && (
            <div className="space-y-3">
              <Label>Turnos configurados</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <AnimatePresence>
                  {barbers.map((barber) => {
                    const barberShifts = getBarberShifts(barber.id);
                    if (barberShifts.length === 0) return null;

                    return (
                      <motion.div
                        key={barber.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-muted/50"
                      >
                        <p className="font-medium text-sm mb-2">{barber.name}</p>
                        <div className="flex flex-wrap gap-1">
                          {barberShifts.map((shift, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {DAY_NAMES[shift.day_of_week].slice(0, 3)}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Manual form */}
          {showForm ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleSubmit}
              className="space-y-4 p-4 rounded-lg border bg-muted/30"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Barbeiro</Label>
                  <Select
                    value={formData.barber_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, barber_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {barbers.map((barber) => (
                        <SelectItem key={barber.id} value={barber.id}>
                          {barber.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dia</Label>
                  <Select
                    value={formData.day_of_week}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, day_of_week: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_NAMES.map((day, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || !formData.barber_id}>
                  Adicionar Turno
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </motion.form>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar turno manualmente
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingStepShifts;
