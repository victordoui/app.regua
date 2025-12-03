import React from 'react';
import { Appointment } from '@/types/appointments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DragPreviewProps {
  appointment: Appointment;
  targetDate: Date;
  targetHour: number;
  barberColor: string;
  style?: React.CSSProperties;
}

const DragPreview: React.FC<DragPreviewProps> = ({
  appointment,
  targetDate,
  targetHour,
  barberColor,
  style
}) => {
  const duration = appointment.services?.duration_minutes || 30;
  const pixelsPerMinute = 48 / 60;
  const height = Math.max(duration * pixelsPerMinute, 20);

  return (
    <div
      className={cn(
        "absolute rounded-md p-1.5 text-xs overflow-hidden pointer-events-none z-30",
        "opacity-70 border-2 border-dashed animate-pulse"
      )}
      style={{
        ...style,
        height: `${height}px`,
        backgroundColor: `${barberColor}20`,
        borderColor: barberColor,
      }}
    >
      <div className="flex flex-col h-full">
        <span className="font-semibold truncate" style={{ color: barberColor }}>
          {appointment.clients?.name || 'Cliente'}
        </span>
        <span className="text-muted-foreground truncate text-[10px]">
          {format(targetDate, 'dd/MM', { locale: ptBR })} às {targetHour.toString().padStart(2, '0')}:00
        </span>
      </div>
      
      {/* Badge showing new position */}
      <div 
        className="absolute -top-6 left-0 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap shadow-lg"
        style={{ 
          backgroundColor: barberColor,
          color: 'white'
        }}
      >
        Mover para {format(targetDate, 'dd/MM')} às {targetHour.toString().padStart(2, '0')}:00
      </div>
    </div>
  );
};

export default DragPreview;
