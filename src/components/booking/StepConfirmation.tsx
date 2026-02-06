import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Gift } from 'lucide-react';
import { BookingForm, Service, Barber, UserSubscription } from '@/types/booking';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatPhoneBR, formatNameOnly, guestContactSchema } from '@/lib/utils';

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
  const [fieldErrors, setFieldErrors] = useState<{
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
  }>({});

  const selectedService = services.find(s => s.id === bookingForm.selectedService);
  const selectedBarber = barbers.find(b => b.id === bookingForm.selectedBarber);
  const finalPrice = calculateFinalPrice();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingForm(prev => ({ ...prev, clientName: formatNameOnly(e.target.value) }));
    if (fieldErrors.clientName) {
      setFieldErrors(prev => ({ ...prev, clientName: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneBR(e.target.value);
    setBookingForm(prev => ({ ...prev, clientPhone: formatted }));
    if (fieldErrors.clientPhone) {
      setFieldErrors(prev => ({ ...prev, clientPhone: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingForm(prev => ({ ...prev, clientEmail: e.target.value }));
    if (fieldErrors.clientEmail) {
      setFieldErrors(prev => ({ ...prev, clientEmail: undefined }));
    }
  };

  const validateField = (field: 'clientName' | 'clientPhone' | 'clientEmail') => {
    const value = bookingForm[field];
    const result = guestContactSchema.shape[field].safeParse(value);
    if (!result.success) {
      setFieldErrors(prev => ({ 
        ...prev, 
        [field]: result.error.errors[0].message 
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
              onChange={handleNameChange}
              onBlur={() => validateField('clientName')}
              placeholder="Seu nome completo"
              className={fieldErrors.clientName ? 'border-destructive' : ''}
              maxLength={100}
              required
            />
            {fieldErrors.clientName && (
              <p className="text-sm text-destructive mt-1">{fieldErrors.clientName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="clientPhone">Telefone *</Label>
            <Input
              id="clientPhone"
              value={bookingForm.clientPhone}
              onChange={handlePhoneChange}
              onBlur={() => validateField('clientPhone')}
              placeholder="(00)0000-0000"
              className={fieldErrors.clientPhone ? 'border-destructive' : ''}
              maxLength={14}
              inputMode="tel"
              required
            />
            {fieldErrors.clientPhone && (
              <p className="text-sm text-destructive mt-1">{fieldErrors.clientPhone}</p>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="clientEmail">Email *</Label>
              <Input
                id="clientEmail"
                type="email"
                value={bookingForm.clientEmail}
                onChange={handleEmailChange}
                onBlur={() => validateField('clientEmail')}
                placeholder="seu@email.com"
                className={fieldErrors.clientEmail ? 'border-destructive' : ''}
                maxLength={255}
                required
              />
              {fieldErrors.clientEmail && (
                <p className="text-sm text-destructive mt-1">{fieldErrors.clientEmail}</p>
              )}
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