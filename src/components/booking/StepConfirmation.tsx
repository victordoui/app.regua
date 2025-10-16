import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Gift } from 'lucide-react';
import { BookingForm, Service, Barber, UserSubscription } from '@/types/booking';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StepConfirmationProps {
  bookingForm: BookingForm;
  setBookingForm: React.Dispatch<React.SetStateAction<BookingForm>>;
  services: Service[];
  barbers: Barber[];
  userSubscription: UserSubscription | null;
  checkingSubscription: boolean;
  checkSubscriptionEligibility: () => Promise<void>;
  calculateFinalPrice: () => number;
}

const StepConfirmation: React.FC<StepConfirmationProps> = ({
  bookingForm,
  setBookingForm,
  services,
  barbers,
  userSubscription,
  checkingSubscription,
  checkSubscriptionEligibility,
  calculateFinalPrice
}) => {
  const selectedService = services.find(s => s.id === bookingForm.selectedService);
  const selectedBarber = barbers.find(b => b.id === bookingForm.selectedBarber);
  const finalPrice = calculateFinalPrice();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">4. Confirmação e Dados</h2>
      
      {/* Resumo do Agendamento */}
      <Card className="bg-muted/50 border-primary/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Serviço:</span>
            <span className="font-semibold">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Profissional:</span>
            <span className="font-semibold">{selectedBarber?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Data:</span>
            <span className="font-semibold">
              {bookingForm.selectedDate ? format(bookingForm.selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Horário:</span>
            <span className="font-semibold">{bookingForm.selectedTime}</span>
          </div>
          <hr className="my-2 border-border" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>R$ {finalPrice.toFixed(2)}</span>
          </div>
          {userSubscription && userSubscription.credits_remaining > 0 && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <Gift className="h-3 w-3" />
              Desconto de {userSubscription.discount_percentage}% aplicado!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seus Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clientName">Nome Completo *</Label>
            <Input
              id="clientName"
              value={bookingForm.clientName}
              onChange={(e) => setBookingForm(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="clientPhone">Telefone *</Label>
            <Input
              id="clientPhone"
              value={bookingForm.clientPhone}
              onChange={(e) => setBookingForm(prev => ({ ...prev, clientPhone: e.target.value }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="clientEmail">Email *</Label>
              <Input
                id="clientEmail"
                type="email"
                value={bookingForm.clientEmail}
                onChange={(e) => setBookingForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={checkSubscriptionEligibility}
                disabled={checkingSubscription || !bookingForm.clientEmail}
                variant="outline"
              >
                {checkingSubscription ? "Verificando..." : "Verificar Assinatura"}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              value={bookingForm.notes}
              onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Alguma observação especial para o seu atendimento?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepConfirmation;