import React from "react";

interface RevenueLineChartProps {
  data: { month: string; revenue: number }[];
}

const RevenueLineChart: React.FC<RevenueLineChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-[hsl(var(--border))] rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-[18px] pt-[14px] pb-[10px]">
        <span className="font-heading text-[13px] font-bold text-foreground">Faturamento Mensal</span>
        <button className="flex items-center gap-[5px] border border-[hsl(var(--border))] rounded-[7px] px-[10px] py-1 text-[11px] text-muted-foreground bg-transparent cursor-pointer hover:bg-[hsl(var(--card-2))]">
          Últimos 6 meses
        </button>
      </div>

      <div className="px-[18px] pb-[14px]">
        {/* Legend */}
        <div className="flex gap-[14px] mb-2.5">
          <div className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />Receita
          </div>
          <div className="flex items-center gap-[5px] text-[11px] text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))]" />Meta
          </div>
        </div>

        {/* SVG Chart */}
        <svg width="100%" height="200" viewBox="0 0 340 200" preserveAspectRatio="none" className="block">
          <defs>
            <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {/* Grid */}
          {[16, 46, 76, 106].map(y => (
            <line key={y} x1="28" y1={y} x2="340" y2={y} stroke="#F1F5F9" strokeWidth="1" />
          ))}
          {/* Y labels */}
          <text x="0" y="19" fontSize="8" fill="#94A3B8" fontFamily="Open Sans,sans-serif">8k</text>
          <text x="0" y="49" fontSize="8" fill="#94A3B8" fontFamily="Open Sans,sans-serif">6k</text>
          <text x="0" y="79" fontSize="8" fill="#94A3B8" fontFamily="Open Sans,sans-serif">4k</text>
          <text x="0" y="109" fontSize="8" fill="#94A3B8" fontFamily="Open Sans,sans-serif">2k</text>
          {/* Meta dashed */}
          <line x1="28" y1="56" x2="340" y2="56" stroke="hsl(142, 71%, 45%)" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.5" />
          {/* Revenue area */}
          <path d="M36,106 C56,106 70,76 90,80 C110,84 124,46 148,52 C172,58 188,76 210,60 C232,44 250,36 274,30 C298,24 316,30 340,20 L340,130 L36,130Z" fill="url(#rg)" />
          <path d="M36,106 C56,106 70,76 90,80 C110,84 124,46 148,52 C172,58 188,76 210,60 C232,44 250,36 274,30 C298,24 316,30 340,20" fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="2" strokeLinecap="round" />
          {/* Peak dot + tooltip */}
          <circle cx="274" cy="30" r="4" fill="#fff" stroke="hsl(217, 91%, 60%)" strokeWidth="2" />
          <rect x="220" y="6" width="100" height="22" rx="5" fill="#1E293B" />
          <text x="270" y="21" fontSize="9.5" fill="white" textAnchor="middle" fontWeight="600" fontFamily="Open Sans,sans-serif">
            Nov · R$ 7.240
          </text>
          <circle cx="340" cy="20" r="4" fill="hsl(217, 91%, 60%)" />
          {/* X labels */}
          {['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'].map((label, i) => {
            const x = 36 + i * (304 / 5);
            return <text key={label} x={x} y="148" fontSize="8" fill="#94A3B8" textAnchor="middle" return <text key={label} x={x} y="148" fontSize="8" fill="#94A3B8" textAnchor="middle" fontFamily="Montserrat,sans-serif">{label}</text>;;
          })}
        </svg>
      </div>
    </div>
  );
};

export default RevenueLineChart;
