import React from "react";

const heatColors = [
  "bg-[hsl(var(--primary-50))]",           // h0 - empty
  "bg-[#BFDBFE]",                           // h1
  "bg-[#93C5FD]",                           // h2
  "bg-[#60A5FA] text-white",               // h3
  "bg-[#3B82F6] text-white",               // h4
  "bg-primary text-white",                  // h5
];

// Mock data: rows = time slots, cols = days
const data = [
  [2, 3, 1, 4, 5, 4, 0], // 09h
  [4, 5, 3, 3, 4, 5, 1], // 11h
  [3, 2, 5, 4, 3, 5, 0], // 14h
  [5, 4, 4, 5, 5, 4, 1], // 16h
  [2, 3, 2, 3, 4, 5, 0], // 18h
];
const timeLabels = ["09h", "11h", "14h", "16h", "18h"];
const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const OccupationHeatmap = () => {
  return (
    <div className="bg-white border border-[hsl(var(--border))] rounded-[14px] overflow-hidden min-h-[300px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-heading text-[13px] font-bold text-foreground">Ocupação por Horário</span>
        <button className="flex items-center gap-[5px] border border-[hsl(var(--border))] rounded-[7px] px-[10px] py-1 text-[11px] text-muted-foreground bg-transparent cursor-pointer hover:bg-[hsl(var(--card-2))]">
          Esta Semana
        </button>
      </div>

      {/* Legend */}
      <div className="px-[18px] pb-1.5 flex gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-[3px] bg-[hsl(var(--primary-50))]" />Livre
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-[3px] bg-[#60A5FA]" />Moderado
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-[3px] bg-primary" />Lotado
        </div>
      </div>

      {/* Grid */}
      <div className="px-[18px] pb-[14px]">
        <div className="grid grid-cols-[38px_repeat(7,1fr)] grid-rows-[24px_repeat(5,36px)] gap-1.5">
          {/* Column headers */}
          <div />
          {dayLabels.map(d => (
            <div key={d} className="flex items-center justify-center text-[9px] font-semibold text-muted-foreground uppercase">{d}</div>
          ))}

          {/* Rows */}
          {data.map((row, ri) => (
            <React.Fragment key={ri}>
              <div className="flex items-center justify-end pr-1.5 text-[10px] text-muted-foreground font-medium">
                {timeLabels[ri]}
              </div>
              {row.map((val, ci) => (
                <div
                  key={ci}
                  className={`rounded-[5px] flex items-center justify-center text-[9px] font-semibold cursor-pointer transition-transform hover:scale-110 ${heatColors[val]}`}
                >
                  {val > 0 ? val : ''}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OccupationHeatmap;
