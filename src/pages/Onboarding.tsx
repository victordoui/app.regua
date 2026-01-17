import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';

import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import OnboardingStepCompany from '@/components/onboarding/OnboardingStepCompany';
import OnboardingStepServices from '@/components/onboarding/OnboardingStepServices';
import OnboardingStepBarbers from '@/components/onboarding/OnboardingStepBarbers';
import OnboardingStepHours from '@/components/onboarding/OnboardingStepHours';
import OnboardingStepShifts from '@/components/onboarding/OnboardingStepShifts';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const {
    isLoading,
    isOnboardingComplete,
    isSaving,
    settings,
    saveSettings,
    services,
    addService,
    barbers,
    addBarber,
    businessHours,
    upsertBusinessHour,
    initializeBusinessHours,
    isInitializing,
    shifts,
    createShift,
    completeOnboarding,
  } = useOnboarding();

  // Company form data
  const [companyData, setCompanyData] = useState({
    company_name: '',
    slogan: '',
    address: '',
    phone: '',
    email: '',
  });

  // Initialize company data from settings
  useEffect(() => {
    if (settings) {
      setCompanyData({
        company_name: settings.company_name || '',
        slogan: settings.slogan || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
      });
    }
  }, [settings]);

  // Redirect if onboarding is already complete
  useEffect(() => {
    if (!isLoading && isOnboardingComplete) {
      navigate('/', { replace: true });
    }
  }, [isLoading, isOnboardingComplete, navigate]);

  // Update completed steps based on data
  useEffect(() => {
    const completed: number[] = [];
    if (settings?.company_name) completed.push(1);
    if (services.length > 0) completed.push(2);
    if (barbers.length > 0) completed.push(3);
    if (businessHours.length > 0) completed.push(4);
    if (shifts.length > 0) completed.push(5);
    setCompletedSteps(completed);
  }, [settings, services, barbers, businessHours, shifts]);

  const handleNext = async () => {
    // Save company data on step 1
    if (currentStep === 1 && companyData.company_name) {
      await saveSettings({
        company_name: companyData.company_name,
        slogan: companyData.slogan,
        address: companyData.address,
        phone: companyData.phone,
        email: companyData.email,
        primary_color_hex: settings?.primary_color_hex || '#0ea5e9',
        secondary_color_hex: settings?.secondary_color_hex || '#1f2937',
        is_public_page_enabled: settings?.is_public_page_enabled ?? true,
        logo_url: settings?.logo_url || '',
        banner_url: settings?.banner_url || '',
        instagram_url: settings?.instagram_url || '',
        facebook_url: settings?.facebook_url || '',
        whatsapp_number: settings?.whatsapp_number || '',
        cancellation_hours_before: settings?.cancellation_hours_before ?? 24,
        allow_online_cancellation: settings?.allow_online_cancellation ?? true,
        buffer_minutes: settings?.buffer_minutes ?? 0,
        noshow_fee_enabled: settings?.noshow_fee_enabled ?? false,
        noshow_fee_amount: settings?.noshow_fee_amount ?? 0,
        onboarding_completed: false,
      });
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
      toast({
        title: "🎉 Configuração concluída!",
        description: "Sua barbearia está pronta para começar.",
      });
      navigate('/', { replace: true });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a configuração.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAddService = async (service: { name: string; description?: string; price: number; duration: number }) => {
    await addService({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      active: true,
      image_url: '',
    });
  };

  const handleAddBarber = async (barber: { name: string; email?: string; phone?: string }) => {
    await addBarber({
      display_name: barber.name,
      email: barber.email || '',
      phone: barber.phone || '',
    });
  };

  const handleUpsertHour = async (data: { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }) => {
    await upsertBusinessHour(data);
  };

  const handleCreateShift = async (shift: { barber_id: string; day_of_week: number; start_time: string; end_time: string; is_recurring: boolean }) => {
    await createShift.mutateAsync(shift);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!companyData.company_name;
      case 2:
        return services.length > 0;
      case 3:
        return barbers.length > 0;
      case 4:
        return businessHours.length > 0;
      case 5:
        return true; // Optional
      default:
        return false;
    }
  };

  // Map services to component format
  const mappedServices = services.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || '',
    price: s.price,
    duration: s.duration_minutes,
  }));

  // Map barbers to component format  
  const mappedBarbers = barbers.map(b => ({
    id: b.id,
    name: b.display_name || 'Barbeiro',
    email: b.email || '',
    phone: b.phone || '',
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <OnboardingWelcome key="welcome" onStart={() => setShowWelcome(false)} />
          ) : (
            <motion.div
              key="wizard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Progress indicator */}
              <OnboardingProgress 
                currentStep={currentStep} 
                completedSteps={completedSteps} 
              />

              {/* Step content */}
              <div className="min-h-[500px] bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl p-6">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <OnboardingStepCompany
                      key="step-1"
                      data={companyData}
                      onChange={(data) => setCompanyData(prev => ({ ...prev, ...data }))}
                    />
                  )}
                  {currentStep === 2 && (
                    <OnboardingStepServices
                      key="step-2"
                      services={mappedServices}
                      onAddService={handleAddService}
                      isLoading={isSaving}
                    />
                  )}
                  {currentStep === 3 && (
                    <OnboardingStepBarbers
                      key="step-3"
                      barbers={mappedBarbers}
                      onAddBarber={handleAddBarber}
                      isLoading={isSaving}
                    />
                  )}
                  {currentStep === 4 && (
                    <OnboardingStepHours
                      key="step-4"
                      businessHours={businessHours}
                      onUpsertHour={handleUpsertHour}
                      onInitializeDefaults={async () => { await initializeBusinessHours(); }}
                      isLoading={isSaving || isInitializing}
                    />
                  )}
                  {currentStep === 5 && (
                    <OnboardingStepShifts
                      key="step-5"
                      barbers={mappedBarbers}
                      shifts={shifts}
                      onCreateShift={handleCreateShift}
                      isLoading={createShift.isPending}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>

                {currentStep < 5 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80"
                  >
                    {isCompleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Concluir
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Skip option for optional step */}
              {currentStep === 5 && (
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="text-muted-foreground"
                  >
                    Pular e finalizar depois
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
