import React from "react";
import { useNavigate } from "react-router-dom";
import { useBarbers } from "@/hooks/useBarbers";
import { Star } from "lucide-react";

const gradients = [
  "from-[#60A5FA] to-[#2563EB]",
  "from-[#6EE7B7] to-[#0D9488]",
  "from-[#FCD34D] to-[#D97706]",
  "from-[#F9A8D4] to-[#EC4899]",
  "from-[#A5B4FC] to-[#7C3AED]",
];

const ProfessionalsPanel = () => {
  const navigate = useNavigate();
  const { barbers } = useBarbers();

  const displayBarbers = barbers.slice(0, 5);

  return (
    <div className="bg-card border border-[hsl(var(--border))] rounded-[14px] overflow-hidden min-h-[260px]">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-heading text-[13px] font-bold text-foreground">Profissionais</span>
        <button
          onClick={() => navigate('/barbers')}
          className="text-[11px] font-semibold text-primary cursor-pointer hover:text-[hsl(var(--brand))]"
        >
          Ver todos →
        </button>
      </div>

      {displayBarbers.length === 0 ? (
        <div className="px-4 pb-4 text-xs text-muted-foreground text-center py-6">
          Nenhum profissional cadastrado.
        </div>
      ) : (
        displayBarbers.map((barber, i) => {
          const initials = (barber.full_name || '')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'BB';

          return (
            <div
              key={barber.id}
              className="flex items-center gap-[10px] px-4 py-[10px] border-b border-[hsl(var(--border))] last:border-b-0 cursor-pointer hover:bg-[hsl(var(--card-2))] transition-colors"
            >
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 relative`}>
                {initials}
                <span className="absolute bottom-px right-px w-2 h-2 rounded-full border-[1.5px] border-white bg-[hsl(var(--success))]" />
              </div>
              <div className="flex-1 min-w-0">
<div className="text-xs font-semibold text-foreground truncate">{barber.full_name}</div>
                <div className="text-[10px] text-muted-foreground mt-px truncate">{barber.specialties?.[0] || 'Barbeiro'}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-heading text-[13px] font-bold text-foreground">
                  — <span className="text-[10px] text-muted-foreground font-body font-normal">hoje</span>
                </div>
                <div className="flex items-center justify-end gap-0.5 text-[10px] text-muted-foreground mt-px">
                  <Star className="h-2.5 w-2.5 text-[#FBBF24] fill-[#FBBF24]" /> 4.8
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProfessionalsPanel;
