import { useCompanySettings } from "./useCompanySettings";
import { useServices } from "./useServices";
import { useBarbers } from "./useBarbers";
import { useBusinessHours } from "./useBusinessHours";
import { useShifts } from "./useShifts";

export const SERVICE_TEMPLATES = [
  { name: 'Corte Masculino', description: 'Corte tradicional masculino', price: 35, duration: 30 },
  { name: 'Barba', description: 'Barba completa com toalha quente', price: 25, duration: 20 },
  { name: 'Corte + Barba', description: 'Combo corte e barba', price: 55, duration: 45 },
  { name: 'Degradê', description: 'Corte degradê personalizado', price: 40, duration: 35 },
  { name: 'Corte Infantil', description: 'Corte para crianças até 12 anos', price: 30, duration: 25 },
  { name: 'Pigmentação', description: 'Pigmentação capilar', price: 80, duration: 60 },
  { name: 'Sobrancelha', description: 'Design de sobrancelha', price: 15, duration: 10 },
  { name: 'Hidratação', description: 'Tratamento de hidratação capilar', price: 45, duration: 30 },
];

export const DEFAULT_HOURS = {
  weekdays: { open: '09:00', close: '19:00' },
  saturday: { open: '09:00', close: '17:00' },
  sunday: { closed: true },
};

export function useOnboarding() {
  const { settings, isLoading: settingsLoading, saveSettings, isSaving } = useCompanySettings();
  const { services, isLoading: servicesLoading, addService } = useServices();
  const { barbers, isLoading: barbersLoading, addBarber } = useBarbers();
  const { businessHours, isLoading: hoursLoading, upsertBusinessHour, initializeBusinessHours, isInitializing } = useBusinessHours();
  const { shifts, isLoading: shiftsLoading, createShift } = useShifts();

  const isLoading = settingsLoading || servicesLoading || barbersLoading || hoursLoading || shiftsLoading;
  const isOnboardingComplete = settings?.onboarding_completed ?? false;

  const completeOnboarding = async () => {
    if (settings) {
      await saveSettings({
        company_name: settings.company_name,
        slogan: settings.slogan || '',
        primary_color_hex: settings.primary_color_hex,
        secondary_color_hex: settings.secondary_color_hex,
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        is_public_page_enabled: settings.is_public_page_enabled,
        logo_url: settings.logo_url || '',
        banner_url: settings.banner_url || '',
        instagram_url: settings.instagram_url || '',
        facebook_url: settings.facebook_url || '',
        whatsapp_number: settings.whatsapp_number || '',
        cancellation_hours_before: settings.cancellation_hours_before,
        allow_online_cancellation: settings.allow_online_cancellation,
        buffer_minutes: settings.buffer_minutes,
        noshow_fee_enabled: settings.noshow_fee_enabled,
        noshow_fee_amount: settings.noshow_fee_amount,
        onboarding_completed: true,
      });
    }
  };

  const getProgress = () => {
    let completed = 0;
    const total = 4; // Empresa, Serviços, Barbeiros, Horários (Turnos é opcional)
    
    if (settings?.company_name) completed++;
    if (services && services.length > 0) completed++;
    if (barbers && barbers.length > 0) completed++;
    if (businessHours && businessHours.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1: // Empresa
        return !!settings?.company_name;
      case 2: // Serviços
        return services && services.length > 0;
      case 3: // Barbeiros
        return barbers && barbers.length > 0;
      case 4: // Horários
        return businessHours && businessHours.length > 0;
      case 5: // Turnos (opcional)
        return true;
      default:
        return false;
    }
  };

  return {
    // Status
    isLoading,
    isOnboardingComplete,
    isSaving,
    isInitializing,
    
    // Progress
    getProgress,
    canProceedFromStep,
    completeOnboarding,
    
    // Company Settings
    settings,
    saveSettings,
    
    // Services
    services: services || [],
    addService,
    
    // Barbers
    barbers: barbers || [],
    addBarber,
    
    // Business Hours
    businessHours: businessHours || [],
    upsertBusinessHour,
    initializeBusinessHours,
    
    // Shifts
    shifts: shifts || [],
    createShift,
    
    // Templates
    SERVICE_TEMPLATES,
    DEFAULT_HOURS,
  };
}
