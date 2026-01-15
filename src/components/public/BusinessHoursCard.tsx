import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface BusinessHour {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

interface BusinessHoursCardProps {
  hours: BusinessHour[];
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const SHORT_DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const BusinessHoursCard: React.FC<BusinessHoursCardProps> = ({ hours }) => {
  const today = new Date().getDay();

  // Sort by day of week starting from Monday (1)
  const sortedHours = [...hours].sort((a, b) => {
    const aDay = a.day_of_week === 0 ? 7 : a.day_of_week;
    const bDay = b.day_of_week === 0 ? 7 : b.day_of_week;
    return aDay - bDay;
  });

  const isOpen = () => {
    const todayHours = hours.find(h => h.day_of_week === today);
    if (!todayHours || todayHours.is_closed) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return todayHours.open_time && todayHours.close_time && 
           currentTime >= todayHours.open_time && 
           currentTime <= todayHours.close_time;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Horário de Funcionamento
          </CardTitle>
          <Badge variant={isOpen() ? 'default' : 'secondary'} className={isOpen() ? 'bg-green-500' : ''}>
            {isOpen() ? 'Aberto' : 'Fechado'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedHours.map((hour) => {
            const isToday = hour.day_of_week === today;
            
            return (
              <div
                key={hour.day_of_week}
                className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                  isToday ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <span className={`text-sm ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {DAY_NAMES[hour.day_of_week]}
                </span>
                <span className={`text-sm ${hour.is_closed ? 'text-destructive' : ''}`}>
                  {hour.is_closed 
                    ? 'Fechado' 
                    : `${hour.open_time || '00:00'} - ${hour.close_time || '00:00'}`
                  }
                </span>
              </div>
            );
          })}
        </div>

        {hours.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            Horários não configurados
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessHoursCard;
