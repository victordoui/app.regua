import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, ArrowRight, Calendar, Clock, User, MapPin, Scissors } from 'lucide-react';
import { ClientBookingForm, PUBLIC_STEPS, Branch, PublicService, PublicBarber, PublicTimeSlot } from '@/types/publicBooking';
import { useToast } from '@/hooks/use-toast';
import StepIndicator from '../booking/StepIndicator'; // Caminho ajustado
import StepBranchSelection from './public/StepBranchSelection';
import StepBarberSelection from './public/StepBarberSelection';
import StepServiceSelection from './public/StepServiceSelection';
import StepDateTimeSelection from './public/StepDateTimeSelection';
import StepConfirmation from './public/StepConfirmation';

// --- MOCK DATA (Em um sistema real, viria do Supabase/API) ---
const mockBranches: Branch[] = [
  { id: '1', name: 'Unidade Centro', address: 'Rua Principal, 100', working_hours: 'Seg-Sáb, 9h-19h' },
  { id: '2', name: 'Unidade Shopping', address: 'Av. Comercial, 500', working_hours: 'Seg-Dom, 10h-22h' },
];

const mockBarbers: PublicBarber[] = [
  { id: 'b1', name: 'Carlos Silva', specialties: ['Corte Clássico', 'Barba'], avatar: '' },
  { id: 'b2', name: 'Ana Souza', specialties: ['Corte Feminino', 'Coloração'], avatar: '' },
  { id: 'b3', name: 'Roberto Mendes', specialties: ['Combo Premium'], avatar: '' },
];

const mockServices: PublicService[] = [
  { id: 's1', name: 'Corte Clássico', description: 'Corte de cabelo profissional', price: 50, duration_minutes: 30 },
  { id: 's2', name: 'Barba Terapia', description: 'Barba com toalha quente', price: 40, duration_minutes: 30 },
  { id: 's3', name: 'Combo Corte + Barba', description: 'Corte e barba completos', price: 85, duration_minutes: 60 },
];

const mockTimeSlots: PublicTimeSlot[] = [
  { time: '09:00', available: true, barberId: 'b1' },
  { time: '09:30', available: false, barberId: 'b2', conflictReason: 'Ocupado' },
  { time: '10:00', available: true, barberId: 'b3' },
  { time: '10:30', available: true, barberId: 'b1' },
];
// -------------------------------------------------------------

interface ClientBookingFlowProps {
  // userId: string; // ID do dono da barbearia para buscar dados reais
}

const ClientBookingFlow: React.FC<ClientBookingFlowProps> = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

  const currentStepData = PUBLIC_STEPS.find(s => s.id === currentStep);

  const calculateTotalDuration = useMemo(() => {
    const selected = mockServices.filter(s => formData.selectedServices.includes(s.id));
    return selected.reduce((sum, s) => sum + s.duration_minutes, 0);
  }, [formData.selectedServices]);

  const calculateTotalPrice = useMemo(() => {
    const selected = mockServices.filter(s => formData.selectedServices.includes(s.id));
    return selected.reduce((sum, s) => sum + s.price, 0);
  }, [formData.selectedServices]);

  const handleNext = () => {
    // Validação do passo atual
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
      // Simulação de chamada API para agendamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui você faria a inserção no Supabase:
      // const { error } = await supabase.from('appointments').insert({...formData, user_id: ownerId, status: 'pending'});
      
      toast({
        title: "Agendamento Concluído!",
        description: "Seu horário foi reservado com sucesso. Você receberá uma confirmação.",
        variant: "default",
      });

      // Resetar o formulário e voltar ao início
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

    } catch (error) {
      toast({
        title: "Erro ao Agendar",
        description: "Não foi possível finalizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepBranchSelection formData={formData} setFormData={setFormData} branches={mockBranches} />;
      case 2:
        return <StepBarberSelection formData={formData} setFormData={setFormData} barbers={mockBarbers} />;
      case 3:
        return <StepServiceSelection formData={formData} setFormData={setFormData} services={mockServices} />;
      case 4:
        return <StepDateTimeSelection 
          formData={formData} 
          setFormData={setFormData} 
          timeSlots={mockTimeSlots} 
          loading={false} 
          totalDuration={calculateTotalDuration}
        />;
      case 5:
        return <StepConfirmation 
          formData={formData} 
          setFormData={setFormData} 
          branches={mockBranches}
          barbers={mockBarbers}
          services={mockServices}
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
          
          {/* Indicador de Progresso */}
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
              {/* Conteúdo do Passo */}
              {renderStepContent()}

              {/* Navegação e Resumo Flutuante */}
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
                    disabled={isSubmitting}
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
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