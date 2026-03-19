import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MiniCalendarPanel = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock: days with appointments
  const daysWithApt = new Set([3, 4, 6, 10, 12, 14, 19, 21, 25]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const dowLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="bg-card border border-[hsl(var(--border))] rounded-[14px] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-heading text-[13px] font-bold text-foreground capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-[26px] h-[26px] border border-[hsl(var(--border))] rounded-[7px] bg-card flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-all"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-[26px] h-[26px] border border-[hsl(var(--border))] rounded-[7px] bg-card flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-all"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px">
        {/* DOW headers */}
        {dowLabels.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold text-muted-foreground pb-1.5">{d}</div>
        ))}

        {/* Days */}
        {days.map((d, i) => {
          const inMonth = isSameMonth(d, currentMonth);
          const today = isToday(d);
          const hasApt = inMonth && daysWithApt.has(d.getDate());

          return (
            <div key={i} className="flex items-center justify-center">
              <div
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] cursor-pointer transition-colors relative
                  ${today ? 'bg-primary text-white font-bold' : ''}
                  ${!inMonth ? 'text-[hsl(var(--clean-gray-300))]' : !today ? 'text-foreground hover:bg-[hsl(var(--primary-100))]' : ''}
                  ${hasApt && !today ? 'font-semibold' : ''}`}
              >
                {d.getDate()}
                {hasApt && (
                  <span className={`absolute bottom-px left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${today ? 'bg-white' : 'bg-primary'}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendarPanel;
