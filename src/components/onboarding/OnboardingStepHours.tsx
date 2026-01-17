import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Clock, Sparkles } from 'lucide-react';
import { DEFAULT_HOURS } from '@/hooks/useOnboarding';

interface BusinessHour {
  id?: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

interface OnboardingStepHoursProps {
  businessHours: BusinessHour[];
  onUpsertHour: (data: { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }) => Promise<void>;
  onInitializeDefaults: () => Promise<void>;
  isLoading?: boolean;
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const OnboardingStepHours: React.FC<OnboardingStepHoursProps> = ({
  businessHours,
  onUpsertHour,
  onInitializeDefaults,
  isLoading,
}) => {
  const [schedule, setSchedule] = useState<{ [key: number]: { open: string; close: string; isOpen: boolean } }>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize schedule from existing hours or defaults
    const initialSchedule: { [key: number]: { open: string; close: string; isOpen: boolean } } = {};
    
    for (let i = 0; i < 7; i++) {
      const existingHour = businessHours.find(h => h.day_of_week === i);
      
      if (existingHour) {
        initialSchedule[i] = {
          open: existingHour.open_time || '09:00',
          close: existingHour.close_time || '19:00',
          isOpen: !existingHour.is_closed,
        };
      } else {
        // Use defaults
        if (i === 0) { // Sunday
          initialSchedule[i] = { open: '09:00', close: '17:00', isOpen: false };
        } else if (i === 6) { // Saturday
          initialSchedule[i] = { open: DEFAULT_HOURS.saturday.open, close: DEFAULT_HOURS.saturday.close, isOpen: true };
        } else { // Weekdays
          initialSchedule[i] = { open: DEFAULT_HOURS.weekdays.open, close: DEFAULT_HOURS.weekdays.close, isOpen: true };
        }
      }
    }
    
    setSchedule(initialSchedule);
  }, [businessHours]);

  const handleToggleDay = (day: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day]?.isOpen },
    }));
    setHasChanges(true);
  };

  const handleTimeChange = (day: number, field: 'open' | 'close', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    for (let i = 0; i < 7; i++) {
      const daySchedule = schedule[i];
      if (daySchedule) {
        await onUpsertHour({
          day_of_week: i,
          open_time: daySchedule.isOpen ? daySchedule.open : null,
          close_time: daySchedule.isOpen ? daySchedule.close : null,
          is_closed: !daySchedule.isOpen,
        });
      }
    }
    setHasChanges(false);
  };

  const handleUseDefaults = async () => {
    await onInitializeDefaults();
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
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Horários de Funcionamento</CardTitle>
          <CardDescription>
            Configure os dias e horários de atendimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {businessHours.length === 0 && (
            <Button
              variant="outline"
              className="w-full gap-2 mb-4"
              onClick={handleUseDefaults}
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4" />
              Usar horários padrão (Seg-Sáb 9h-19h)
            </Button>
          )}

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {DAY_NAMES.map((dayName, index) => {
              const daySchedule = schedule[index];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-20 flex items-center gap-2">
                    <Switch
                      checked={daySchedule?.isOpen ?? false}
                      onCheckedChange={() => handleToggleDay(index)}
                    />
                    <span className="text-sm font-medium">{dayName.slice(0, 3)}</span>
                  </div>

                  {daySchedule?.isOpen ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={daySchedule.open}
                        onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
                        className="h-9 w-24"
                      />
                      <span className="text-muted-foreground">às</span>
                      <Input
                        type="time"
                        value={daySchedule.close}
                        onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
                        className="h-9 w-24"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Fechado</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button 
                onClick={handleSaveAll} 
                className="w-full"
                disabled={isLoading}
              >
                Salvar Horários
              </Button>
            </motion.div>
          )}

          {businessHours.length > 0 && !hasChanges && (
            <p className="text-center text-sm text-muted-foreground">
              ✓ Horários configurados
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingStepHours;
