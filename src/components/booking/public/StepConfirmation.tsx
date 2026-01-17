import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientBookingForm, Branch, PublicService, PublicBarber } from '@/types/publicBooking';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tag, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StepConfirmationProps {
  formData: ClientBookingForm;
  setFormData: React.Dispatch<React.SetStateAction<ClientBookingForm>>;
  branches: Branch[];
  barbers: PublicBarber[];
  services: PublicService[];
  totalPrice: number;
  userId?: string; // Owner's user ID for coupon validation
}

const StepConfirmation: React.FC<StepConfirmationProps> = ({
  formData,
  setFormData,
  branches,
  barbers,
  services,
  totalPrice,
  userId
}) => {
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  const selectedBranch = branches.find(b => b.id === formData.selectedBranch);
  const selectedBarber = barbers.find(b => b.id === formData.selectedBarber);
  const selectedServices = services.filter(s => formData.selectedServices.includes(s.id));

  const finalPrice = totalPrice - (formData.discountAmount || 0);

  const handleValidateCoupon = async () => {
    if (!couponInput.trim()) {
      toast({ title: 'Digite um código de cupom', variant: 'destructive' });
      return;
    }

    setIsValidating(true);
    try {
      // Fetch coupon by code
      const { data: coupon, error } = await supabase
        .from('discount_coupons')
        .select('*')
        .eq('code', couponInput.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast({ title: 'Cupom não encontrado', variant: 'destructive' });
        return;
      }

      // Validate coupon
      const now = new Date();
      const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

      if (validFrom && now < validFrom) {
        toast({ title: 'Cupom ainda não está válido', variant: 'destructive' });
        return;
      }

      if (validUntil && now > validUntil) {
        toast({ title: 'Cupom expirado', variant: 'destructive' });
        return;
      }

      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        toast({ title: 'Cupom esgotado', variant: 'destructive' });
        return;
      }

      if (coupon.min_purchase && totalPrice < coupon.min_purchase) {
        toast({ 
          title: 'Valor mínimo não atingido', 
          description: `Este cupom requer compra mínima de R$ ${coupon.min_purchase.toFixed(2)}`,
          variant: 'destructive' 
        });
        return;
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (totalPrice * coupon.discount_value) / 100;
      } else {
        discount = coupon.discount_value;
      }

      // Apply coupon
      setFormData(prev => ({
        ...prev,
        couponCode: coupon.code,
        discountAmount: discount,
        appliedCouponId: coupon.id
      }));

      toast({ 
        title: 'Cupom aplicado!', 
        description: `Desconto de R$ ${discount.toFixed(2)} aplicado` 
      });
      setCouponInput('');
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({ title: 'Erro ao validar cupom', variant: 'destructive' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setFormData(prev => ({
      ...prev,
      couponCode: undefined,
      discountAmount: undefined,
      appliedCouponId: undefined
    }));
    toast({ title: 'Cupom removido' });
  };

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
          
          {/* Coupon Display */}
          {formData.couponCode && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">{formData.couponCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">-R$ {formData.discountAmount?.toFixed(2)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleRemoveCoupon}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          
          <hr className="my-2 border-border" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <div className="text-right">
              {formData.discountAmount && formData.discountAmount > 0 && (
                <span className="text-sm line-through text-muted-foreground mr-2">
                  R$ {totalPrice.toFixed(2)}
                </span>
              )}
              <span className={formData.discountAmount ? 'text-green-600' : ''}>
                R$ {finalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Input */}
      {!formData.couponCode && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Cupom de Desconto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código do cupom"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button 
                onClick={handleValidateCoupon}
                disabled={isValidating || !couponInput.trim()}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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