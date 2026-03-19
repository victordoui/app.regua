import React from "react";
import { useNavigate } from "react-router-dom";
import { useBarbers } from "@/hooks/useBarbers";
import { Star, Trophy } from "lucide-react";

const gradients = [
  "from-[#60A5FA] to-[#2563EB]",
  "from-[#6EE7B7] to-[#0D9488]",
  "from-[#FCD34D] to-[#D97706]",
  "from-[#F9A8D4] to-[#EC4899]",
  "from-[#A5B4FC] to-[#7C3AED]",
];

const rankColors: Record<number, string> = {
  0: "text-[#FBBF24]",
  1: "text-[#9CA3AF]",
  2: "text-[#CD7F32]",
};

const rankBgColors: Record<number, string> = {
  0: "bg-[#FBBF24]/15",
  1: "bg-[#9CA3AF]/15",
  2: "bg-[#CD7F32]/15",
};

const mockBarbers = [
  { id: "mock-b1", full_name: "Diego Fernandes" },
  { id: "mock-b2", full_name: "Thiago Santos" },
  { id: "mock-b3", full_name: "Mateus Almeida" },
  { id: "mock-b4", full_name: "Bruno Oliveira" },
  { id: "mock-b5", full_name: "Felipe Costa" },
];

const performanceScores = [95, 88, 76, 62, 50];
const ratings = [4.9, 4.8, 4.6, 4.3, 4.1];

const ProfessionalsPanel = () => {
  const navigate = useNavigate();
  const { barbers } = useBarbers();
  const realBarbers = barbers.slice(0, 5);
  const displayBarbers = realBarbers.length > 0 ? realBarbers : mockBarbers;

  return (
    <div className="bg-card border border-border rounded-[14px] overflow-hidden h-fit">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="font-heading text-[15px] font-bold text-foreground">Ranking de Profissionais</span>
        <button
          onClick={() => navigate("/barbers")}
          className="text-[11px] font-semibold text-primary cursor-pointer hover:opacity-80"
        >
          Ver todos →
        </button>
      </div>

      {displayBarbers.map((barber, i) => {
        const initials = (barber.full_name || "")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "BB";

        const score = performanceScores[i] || 50;
        const rating = ratings[i] || 4.0;
        const isTop3 = i < 3;

        return (
          <div
            key={barber.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                isTop3
                  ? `${rankBgColors[i]} ${rankColors[i]}`
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i === 0 ? <Trophy className="h-3 w-3" /> : `${i + 1}º`}
            </div>

            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 relative`}
            >
              {initials}
              <span className="absolute bottom-px right-px w-2 h-2 rounded-full border-[1.5px] border-card bg-[hsl(var(--success))]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{barber.full_name}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-[#FBBF24] fill-[#FBBF24]" />
                  <span className="text-[11px] font-semibold text-foreground">{rating}</span>
                </div>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{score}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfessionalsPanel;
