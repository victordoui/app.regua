import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ArrowLeft, ArrowRight, Loader2, CheckCircle, Calendar, Clock, User, Scissors } from 'lucide-react';
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
import { ptBR } from 'date-fns/locale';

interface ClientBookingFlowProps {
  userId?: string;
}

interface CompletedBookingData {
  date: string;
  time: string;
  services: string[];
  barber: string;
  totalPrice: number;
}

const ClientBookingFlow: React.FC<ClientBookingFlowProps> = ({ userId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [completedBookingData, setCompletedBookingData] = useState<CompletedBookingData | null>(null);
  const [countdown, setCountdown] = useState(100);
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

  // Countdown timer for redirect
  useEffect(() => {
    if (bookingCompleted && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            // Redirect to home
            if (userId) {
              window.location.href = `/b/${userId}/home`;
            } else {
              window.location.href = '/';
            }
            return 0;
          }
          return prev - 20; // Decreases by 20% every second (5 seconds total)
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [bookingCompleted, userId]);

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

        // Fetch active services WITH image_url
        const { data: servicesData } = await supabase
          .from("services")
          .select("id, name, description, price, duration_minutes, image_url")
          .eq("active", true)
          .order("price", { ascending: true });

        if (servicesData) {
          setServices(servicesData.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            price: Number(s.price),
            duration_minutes: s.duration_minutes,
            image_url: s.image_url || undefined
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

        // Fetch buffer_minutes from settings
        const { data: settingsData } = await supabase
          .from("barbershop_settings")
          .select("buffer_minutes")
          .limit(1)
          .single();
        
        const bufferMinutes = settingsData?.buffer_minutes || 0;

        // Fetch blocked slots for the barber
        const { data: blockedSlots } = await supabase
          .from("blocked_slots")
          .select("*")
          .eq("barber_id", formData.selectedBarber);

        // Generate time slots from 9:00 to 19:00
        const slots: PublicTimeSlot[] = [];
        const startHour = 9;
        const endHour = 19;
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            // Check if slot is blocked
            const slotDateTime = new Date(formData.selectedDate);
            slotDateTime.setHours(hour, minute, 0, 0);
            
            const isBlocked = blockedSlots?.some((block: any) => {
              const blockStart = new Date(block.start_datetime);
              const blockEnd = new Date(block.end_datetime);
              return slotDateTime >= blockStart && slotDateTime < blockEnd;
            });

            if (isBlocked) {
              slots.push({
                time: timeStr,
                available: false,
                barberId: formData.selectedBarber,
                conflictReason: 'Horário bloqueado'
              });
              continue;
            }
            
            // Check if slot is occupied (considering duration + buffer)
            const isOccupied = existingAppointments?.some((apt: any) => {
              const aptTime = apt.appointment_time.slice(0, 5);
              const aptDuration = apt.services?.duration_minutes || 30;
              const aptParts = aptTime.split(':').map(Number);
              const slotParts = timeStr.split(':').map(Number);
              
              const aptStartMinutes = aptParts[0] * 60 + aptParts[1];
              const aptEndMinutes = aptStartMinutes + aptDuration + bufferMinutes;
              const slotMinutes = slotParts[0] * 60 + slotParts[1];
              const slotEndMinutes = slotMinutes + calculateTotalDuration;
              
              // Check overlap
              return (slotMinutes < aptEndMinutes && slotEndMinutes > aptStartMinutes);
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
  }, [formData.selectedDate, formData.selectedBarber, calculateTotalDuration]);

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
      // Get the first service for the primary appointment
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
      const { data: appointment, error: appointmentError } = await supabase
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
        })
        .select('id')
        .single();

      if (appointmentError) throw appointmentError;

      // Insert all selected services into appointment_services
      if (appointment && formData.selectedServices.length > 0) {
        const appointmentServices = formData.selectedServices.map(serviceId => {
          const service = services.find(s => s.id === serviceId);
          return {
            appointment_id: appointment.id,
            service_id: serviceId,
            price: service?.price || 0
          };
        });

        const { error: servicesError } = await supabase
          .from("appointment_services")
          .insert(appointmentServices);

        if (servicesError) {
          console.error("Error inserting appointment services:", servicesError);
        }
      }

      // Set completed booking data for confirmation screen
      const selectedBarber = barbers.find(b => b.id === formData.selectedBarber);
      const selectedServiceNames = services
        .filter(s => formData.selectedServices.includes(s.id))
        .map(s => s.name);

      setCompletedBookingData({
        date: format(formData.selectedDate!, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
        time: formData.selectedTime,
        services: selectedServiceNames,
        barber: selectedBarber?.name || 'Profissional',
        totalPrice: calculateTotalPrice
      });
      
      setBookingCompleted(true);

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

  // Render confirmation screen after booking is complete
  if (bookingCompleted && completedBookingData) {
    return (
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="shadow-elegant text-center">
              <CardContent className="pt-12 pb-8">
                {/* Success Icon */}
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-14 w-14 text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Agendamento Confirmado!
                </h2>
                <p className="text-muted-foreground mb-8">
                  Seu horário foi reservado com sucesso.
                </p>

                {/* Booking Details */}
                <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-semibold">{completedBookingData.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-semibold">{completedBookingData.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Scissors className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Serviços</p>
                      <p className="font-semibold">{completedBookingData.services.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Profissional</p>
                      <p className="font-semibold">{completedBookingData.barber}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {completedBookingData.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Redirect notice */}
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Redirecionando para a página inicial em breve...
                  </p>
                  <Progress value={countdown} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

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