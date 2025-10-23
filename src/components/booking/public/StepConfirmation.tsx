import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientBookingForm, Branch, PublicService, PublicBarber } from '@/types/publicBooking';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StepConfirmationProps {
  formData: ClientBookingForm;
  setFormData: React.Dispatch<React.SetStateAction<ClientBookingForm>>;
  branches: Branch[];
  barbers: PublicBarber[];
  services: PublicService[];
  totalPrice: number;
}

const StepConfirmation: React.FC<StepConfirmationProps> = ({
  formData,
  setFormData,
  branches,
  barbers,
  services,
  totalPrice
}) => {
  const selectedBranch = branches.find(b => b.id === formData.selectedBranch);
  const selectedBarber = barbers.find(b => b.id === formData.selectedBarber);
  const selectedServices = services.filter(s => formData.selectedServices.includes(s.id));

  return (
    <div className="space-y-6">
      
      {/* Resumo do Agendamento */}
      <Card className="bg-muted/50 border-primary/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Seu Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Filial:</span>
            <span className="font-semibold">{selectedBranch?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Profissional:</span>
            <span className="font-semibold">{selectedBarber?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Data:</span>
            <span className="font-semibold">
              {formData.selectedDate ? format(formData.selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Horário:</span>
            <span className="font-semibold">{formData.selectedTime || 'N/A'}</span>
          </div>
          <div className="pt-2">
            <span className="font-medium block mb-1">Serviços:</span>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              {selectedServices.map(s => (
                <li key={s.id} className="text-xs text-muted-foreground">
                  {s.name} (R$ {s.price.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
          <hr className="my-2 border-border" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>R$ {totalPrice.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seus Dados de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clientName">Nome Completo *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="clientPhone">Telefone *</Label>
            <Input
              id="clientPhone"
              value={formData.clientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          <div>
            <Label htmlFor="clientEmail">Email *</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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