import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { Plus, SlidersHorizontal, Scissors } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { settings } = useCompanySettings();
  const { metrics } = useRealtimeDashboard();
  const companyName = settings?.company_name || "Usuário";
  const bannerUrl = settings?.banner_url;
  const logoUrl = settings?.logo_url;
  const primaryColor = settings?.primary_color_hex || "#2563EB";

  return (
    <div className="mb-4">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          minHeight: 180,
          background: bannerUrl
            ? `url(${bannerUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 60%, ${primaryColor}99 100%)`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Decorative icon */}
        <Scissors className="absolute right-8 bottom-4 h-28 w-28 text-white/10 rotate-[-20deg]" strokeWidth={1} />

        {/* Content */}
        <div className="relative z-10 flex items-end justify-between h-full p-5" style={{ minHeight: 180 }}>
          {/* Left: logo + text */}
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-[72px] w-[72px] rounded-full border-[3px] border-white/80 object-cover shadow-lg bg-white/20"
              />
            ) : (
              <div
                className="h-[72px] w-[72px] rounded-full border-[3px] border-white/80 flex items-center justify-center shadow-lg text-white text-2xl font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                Olá, {companyName} 👋
              </h1>
              <p className="text-sm text-white/80 font-normal mt-0.5 drop-shadow-sm">
                Você tem {metrics.todayAppointments} agendamentos pendentes hoje
              </p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {}}
              className="flex items-center gap-[7px] border border-white/30 bg-white/15 backdrop-blur-sm rounded-[9px] px-4 py-[9px] text-[13px] font-medium text-white cursor-pointer transition-all hover:bg-white/25"
            >
              <SlidersHorizontal className="h-[13px] w-[13px]" />
              Filtros
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="flex items-center gap-[7px] bg-white text-gray-900 border-none rounded-[9px] px-[18px] py-[9px] text-[13px] font-semibold cursor-pointer transition-all hover:bg-white/90 hover:-translate-y-px shadow-lg"
            >
              <Plus className="h-[13px] w-[13px]" strokeWidth={2.2} />
              Novo Agendamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
