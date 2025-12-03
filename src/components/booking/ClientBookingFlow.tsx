import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { ClientBookingForm, PUBLIC_STEPS, Branch, PublicService, PublicBarber, PublicTimeSlot } from '@/types/publicBooking';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StepIndicator from '../booking/StepIndicator';
import StepBranchSelection from './public/StepBranchSelection';
import StepBarberSelection from './public/StepBarberSelection';
import StepServiceSelection from './public/StepServiceSelection';
import StepDateTimeSelection from './public/StepDateTimeSelection';
import StepConfirmation from './public/StepConfirmation';
import { format, addMinutes, parse, isBefore, isAfter, setHours, setMinutes } from 'date-fns';

interface ClientBookingFlowProps {
  userId?: string; // ID do dono da barbearia para buscar dados reais
}

const ClientBookingFlow: React.FC<ClientBookingFlowProps> = ({ userId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Real data from Supabase
  const [branches, setBranches] = useState<Branch[]>([]);
  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [timeSlots, setTimeSlots] = useState<PublicTimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState<ClientBookingForm>({
    step: 1,
    selectedBranch: '',
    selectedBarber: '',
    selectedServices: [],
    selectedDate: undefined,
    selectedTime: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch barbershop settings for branches (simplified - one branch per owner)
        const { data: settingsData } = await supabase
          .from("barbershop_settings")
          .select("id, company_name, address, phone")
          .limit(10);

        if (settingsData && settingsData.length > 0) {
          setBranches(settingsData.map(s => ({
            id: s.id,
            name: s.company_name,
            address: s.address || 'Endereço não informado',
            working_hours: 'Seg-Sáb, 9h-19h'
          })));
        } else {
          // Default branch if no settings
          setBranches([{
            id: 'default',
            name: 'Barbearia Principal',
            address: 'Endereço a confirmar',
            working_hours: 'Seg-Sáb, 9h-19h'
          }]);
        }

        // Fetch active services
        const { data: servicesData } = await supabase
          .from("services")
          .select("id, name, description, price, duration_minutes")
          .eq("active", true)
          .order("price", { ascending: true });

        if (servicesData) {
          setServices(servicesData.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            price: Number(s.price),
            duration_minutes: s.duration_minutes
          })));
        }

        // Fetch active barbers
        const { data: barbersData } = await supabase
          .from("profiles")
          .select("id, display_name, email, specializations, avatar_url")
          .eq("role", "barbeiro")
          .eq("active", true);

        if (barbersData) {
          setBarbers(barbersData.map(b => ({
            id: b.id,
            name: b.display_name || b.email || 'Profissional',
            specialties: b.specializations || [],
            avatar: b.avatar_url || ''
          })));
        }

      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [userId, toast]);

  // Fetch available time slots when date and barber are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!formData.selectedDate || !formData.selectedBarber) {
        setTimeSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const dateStr = format(formData.selectedDate, 'yyyy-MM-dd');
        
        // Fetch existing appointments for the selected barber and date
        const { data: existingAppointments } = await supabase
          .from("appointments")
          .select("appointment_time, services(duration_minutes)")
          .eq("barbeiro_id", formData.selectedBarber)
          .eq("appointment_date", dateStr)
          .neq("status", "cancelled");

        // Generate time slots from 9:00 to 19:00
        const slots: PublicTimeSlot[] = [];
        const startHour = 9;
        const endHour = 19;
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Check if slot is occupied
            const isOccupied = existingAppointments?.some((apt: any) => {
              const aptTime = apt.appointment_time.slice(0, 5);
              return aptTime === timeStr;
            });

            slots.push({
              time: timeStr,
              available: !isOccupied,
              barberId: formData.selectedBarber,
              conflictReason: isOccupied ? 'Horário ocupado' : undefined
            });
          }
        }

        setTimeSlots(slots);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [formData.selectedDate, formData.selectedBarber]);

  const currentStepData = PUBLIC_STEPS.find(s => s.id === currentStep);

  const calculateTotalDuration = useMemo(() => {
    const selected = services.filter(s => formData.selectedServices.includes(s.id));
    return selected.reduce((sum, s) => sum + s.duration_minutes, 0);
  }, [formData.selectedServices, services]);

  const calculateTotalPrice = useMemo(() => {
    const selected = services.filter(s => formData.selectedServices.includes(s.id));
    return selected.reduce((sum, s) => sum + s.price, 0);
  }, [formData.selectedServices, services]);

  const handleNext = () => {
    switch (currentStep) {
      case 1:
        if (!formData.selectedBranch) {
          toast({ title: "Selecione uma filial.", variant: "destructive" });
          return;
        }
        break;
      case 2:
        if (!formData.selectedBarber) {
          toast({ title: "Selecione um profissional.", variant: "destructive" });
          return;
        }
        break;
      case 3:
        if (formData.selectedServices.length === 0) {
          toast({ title: "Selecione pelo menos um serviço.", variant: "destructive" });
          return;
        }
        break;
      case 4:
        if (!formData.selectedDate || !formData.selectedTime) {
          toast({ title: "Selecione a data e o horário.", variant: "destructive" });
          return;
        }
        break;
      case 5:
        if (!formData.clientName || !formData.clientPhone || !formData.clientEmail) {
          toast({ title: "Preencha seus dados de contato.", variant: "destructive" });
          return;
        }
        break;
    }
    setCurrentStep(prev => Math.min(prev + 1, PUBLIC_STEPS.length));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalizeBooking = async () => {
    setIsSubmitting(true);
    try {
      // Get the first service for the appointment (or create multiple appointments)
      const selectedService = services.find(s => formData.selectedServices.includes(s.id));
      if (!selectedService) throw new Error("Serviço não encontrado");

      // First, create or find the client
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("email", formData.clientEmail)
        .single();

      let clientId: string;

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Get a user_id from barbershop_settings or use a default
        const { data: settingsData } = await supabase
          .from("barbershop_settings")
          .select("user_id")
          .limit(1)
          .single();

        if (!settingsData) throw new Error("Configurações da barbearia não encontradas");

        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            user_id: settingsData.user_id,
            name: formData.clientName,
            phone: formData.clientPhone,
            email: formData.clientEmail,
            notes: formData.notes
          })
          .select("id")
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Get user_id from barbershop settings
      const { data: settingsData } = await supabase
        .from("barbershop_settings")
        .select("user_id")
        .limit(1)
        .single();

      if (!settingsData) throw new Error("Configurações da barbearia não encontradas");

      // Create the appointment
      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          user_id: settingsData.user_id,
          client_id: clientId,
          service_id: selectedService.id,
          barbeiro_id: formData.selectedBarber,
          appointment_date: format(formData.selectedDate!, 'yyyy-MM-dd'),
          appointment_time: formData.selectedTime,
          status: 'pending',
          total_price: calculateTotalPrice,
          notes: formData.notes
        });

      if (appointmentError) throw appointmentError;
      
      toast({
        title: "Agendamento Concluído!",
        description: "Seu horário foi reservado com sucesso. Você receberá uma confirmação.",
        variant: "default",
      });

      // Reset form
      setFormData({
        step: 1,
        selectedBranch: '',
        selectedBarber: '',
        selectedServices: [],
        selectedDate: undefined,
        selectedTime: '',
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        notes: '',
      });
      setCurrentStep(1);

    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Erro ao Agendar",
        description: error.message || "Não foi possível finalizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <StepBranchSelection formData={formData} setFormData={setFormData} branches={branches} />;
      case 2:
        return <StepBarberSelection formData={formData} setFormData={setFormData} barbers={barbers} />;
      case 3:
        return <StepServiceSelection formData={formData} setFormData={setFormData} services={services} />;
      case 4:
        return <StepDateTimeSelection 
          formData={formData} 
          setFormData={setFormData} 
          timeSlots={timeSlots} 
          loading={loadingSlots} 
          totalDuration={calculateTotalDuration}
        />;
      case 5:
        return <StepConfirmation 
          formData={formData} 
          setFormData={setFormData} 
          branches={branches}
          barbers={barbers}
          services={services}
          totalPrice={calculateTotalPrice}
        />;
      default:
        return <div>Erro: Passo desconhecido.</div>;
    }
  };

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          
          <StepIndicator currentStep={currentStep} steps={PUBLIC_STEPS} />

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStepData?.name}
              </CardTitle>
              <CardDescription>
                {currentStepData?.name === "Filial" && "Onde você gostaria de ser atendido?"}
                {currentStepData?.name === "Profissional" && "Escolha seu barbeiro preferido."}
                {currentStepData?.name === "Serviços" && "Quais serviços você deseja realizar?"}
                {currentStepData?.name === "Horário" && "Selecione a melhor data e hora."}
                {currentStepData?.name === "Confirmação" && "Revise e finalize seu agendamento."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {renderStepContent()}

              <div className="mt-8 pt-4 border-t border-border flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={handlePrev}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Estimado:</p>
                  <p className="text-xl font-bold text-primary">R$ {calculateTotalPrice.toFixed(2)}</p>
                </div>

                {currentStep < PUBLIC_STEPS.length ? (
                  <Button 
                    variant="default"
                    onClick={handleNext}
                    disabled={isSubmitting || isLoading}
                  >
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    variant="default"
                    onClick={handleFinalizeBooking}
                    disabled={isSubmitting || !formData.clientName || !formData.clientPhone || !formData.clientEmail}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Agendando...
                      </div>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Confirmar Agendamento
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ClientBookingFlow;