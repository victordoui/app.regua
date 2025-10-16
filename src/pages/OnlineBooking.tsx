import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { AppointmentFormData } from "@/types/appointments";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  active: boolean;
}

interface Barber {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

interface UserSubscription {
  id: string;
  plan_name: string;
  status: string;
  credits_remaining: number;
}

const OnlineBooking = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [bookingForm, setBookingForm] = useState<AppointmentFormData>({
    client_id: "",
    service_id: "",
    barbeiro_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
    fetchBarbers();
  }, []);

  const fetchServices = async () => {
    // Mock data
    setServices([
      {
        id: '1',
        name: 'Corte Masculino',
        description: 'Corte de cabelo profissional',
        price: 50,
        duration_minutes: 30,
        active: true
      },
      {
        id: '2',
        name: 'Corte + Barba',
        description: 'Combo completo',
        price: 80,
        duration_minutes: 50,
        active: true
      }
    ]);
  };

  const fetchBarbers = async () => {
    // Mock data
    setBarbers([
      {
        id: '1',
        user_id: '1',
        full_name: 'Carlos Silva',
        email: 'carlos@email.com'
      },
      {
        id: '2',
        user_id: '2',
        full_name: 'João Santos',
        email: 'joao@email.com'
      }
    ]);
  };

  const checkSubscriptionEligibility = async () => {
    if (!bookingForm.client_id) {
      toast({
        title: "Erro",
        description: "Preencha seu email para verificar a elegibilidade",
        variant: "destructive",
      });
      return;
    }

    setCheckingSubscription(true);
    // Mock subscription check
    setTimeout(() => {
      setUserSubscription({
        id: '1',
        plan_name: 'Premium',
        status: 'active',
        credits_remaining: 3
      });
      setCheckingSubscription(false);
      toast({
        title: "Assinatura encontrada!",
        description: "Você tem 3 créditos disponíveis para desconto",
      });
    }, 1000);
  };

  const calculateFinalPrice = () => {
    const selectedService = services.find(s => s.id === bookingForm.service_id);
    let price = selectedService?.price || 0;
    
    if (userSubscription && userSubscription.credits_remaining > 0) {
      price = price * 0.8; // 20% discount
    }
    
    return price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.service_id || !bookingForm.barbeiro_id || !bookingForm.appointment_date || !bookingForm.appointment_time) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Mock booking submission
    toast({
      title: "Agendamento realizado com sucesso!",
      description: "Você receberá uma confirmação por email",
    });
    
    // Reset form
    setBookingForm({
      client_id: "",
      service_id: "",
      barbeiro_id: "",
      appointment_date: "",
      appointment_time: "",
      notes: "",
    });
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Agendamento Online</h1>
            <p className="text-muted-foreground">
              Agende seu horário de forma rápida e fácil
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Complete seu agendamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="service_id">Serviço</Label>
                    <Select value={bookingForm.service_id} onValueChange={(value) => setBookingForm(prev => ({ ...prev, service_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - R$ {service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="barbeiro_id">Profissional</Label>
                    <Select value={bookingForm.barbeiro_id} onValueChange={(value) => setBookingForm(prev => ({ ...prev, barbeiro_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {barbers.map(barber => (
                          <SelectItem key={barber.id} value={barber.id}>
                            {barber.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="appointment_date">Data</Label>
                    <input
                      type="date"
                      id="appointment_date"
                      value={bookingForm.appointment_date}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, appointment_date: e.target.value }))}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="appointment_time">Horário</Label>
                    <input
                      type="time"
                      id="appointment_time"
                      value={bookingForm.appointment_time}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, appointment_time: e.target.value }))}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Alguma observação especial?"
                    rows={3}
                  />
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {calculateFinalPrice().toFixed(2)}
                    </span>
                  </div>
                  
                  {userSubscription && userSubscription.credits_remaining > 0 && (
                    <div className="text-sm text-green-600 mb-4">
                      Desconto de 20% aplicado! Créditos restantes: {userSubscription.credits_remaining}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Confirmar Agendamento
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OnlineBooking;