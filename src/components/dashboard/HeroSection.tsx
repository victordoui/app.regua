import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Scissors } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import EditGreetingDialog from "./EditGreetingDialog";

interface HeroSectionProps {
  todayAppointments: number;
}

const HeroSection = ({ todayAppointments }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { settings } = useCompanySettings();
  const [editOpen, setEditOpen] = useState(false);
  const companyName = settings?.company_name || "Sua Barbearia";
  const bannerUrl = settings?.banner_url;
  const logoUrl = settings?.logo_url;
  const primaryColor = settings?.primary_color_hex || "#2563EB";
  const subtitle = settings?.slogan?.trim()
    ? settings.slogan
    : `Você tem ${todayAppointments} agendamentos hoje`;

  return (
    <section className="overflow-hidden rounded-xl border border-white/20 shadow-[0_16px_40px_-24px_rgba(15,47,107,0.55)]">
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: 180,
          background: bannerUrl
            ? `url(${bannerUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 60%, ${primaryColor}99 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <Scissors className="absolute bottom-4 right-8 h-28 w-28 rotate-[-20deg] text-white/10" strokeWidth={1} />

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="absolute right-3 top-3 z-20 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/30 bg-black/20 px-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/35"
        >
          <Pencil className="h-4 w-4" />
          Editar capa
        </button>

        <div className="relative z-10 flex min-h-[180px] flex-col justify-end gap-5 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-[72px] w-[72px] shrink-0 rounded-full border-[3px] border-white/80 bg-white/20 object-cover shadow-lg"
              />
            ) : (
              <div
                className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-[3px] border-white/80 text-2xl font-bold text-white shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="mb-1 text-sm font-semibold text-white/80">
                {todayAppointments} agendamento{todayAppointments === 1 ? "" : "s"} hoje
              </p>
              <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-[30px]">
                Olá, {companyName} 👋
              </h1>
              <p className="mt-1 text-sm font-medium text-white/85 drop-shadow-sm sm:text-base">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/appointments?new=1")}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-gray-900 shadow-lg transition-all hover:-translate-y-px hover:bg-white/90"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Novo agendamento
          </button>
        </div>
      </div>
      <EditGreetingDialog open={editOpen} onOpenChange={setEditOpen} />
    </section>
  );
};

export default HeroSection;
