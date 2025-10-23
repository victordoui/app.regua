import React, { useState } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'mensal' | 'anual';
  vigency: string;
  features: string[];
  is_popular: boolean;
  slots_remaining: number;
}

const mockPlans: Plan[] = [
  {
    id: 'p1',
    name: 'Plano Essencial',
    description: 'Acesso a agendamentos prioritários e descontos em produtos.',
    price: 29.90,
    billing_cycle: 'mensal',
    vigency: 'Indeterminado',
    features: ['Agendamento prioritário', '5% OFF em produtos', 'Notificações exclusivas'],
    is_popular: false,
    slots_remaining: 100,
  },
  {
    id: 'p2',
    name: 'Plano VIP John\'s Club',
    description: 'Experiência completa com serviços inclusos e descontos máximos.',
    price: 99.90,
    billing_cycle: 'mensal',
    vigency: 'Indeterminado',
    features: ['1 Corte/mês incluso', '1 Barba/mês inclusa', '15% OFF em produtos', 'Bebida cortesia'],
    is_popular: true,
    slots_remaining: 5,
  },
  {
    id: 'p3',
    name: 'Plano Anual Premium',
    description: 'O melhor custo-benefício para quem é fiel ao estilo.',
    price: 999.00,
    billing_cycle: 'anual',
    vigency: '12 meses',
    features: ['Todos os benefícios VIP', '2 meses grátis', 'Acesso a eventos exclusivos'],
    is_popular: false,
    slots_remaining: 50,
  },
];

const mockProfessionals = [
  { id: 'b1', name: 'Carlos Silva' },
  { id: 'b2', name: 'Ana Souza' },
  { id: 'b3', name: 'Roberto Mendes' },
];

const ClientPlans = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [indicator, setIndicator] = useState('');
  const [hasCard, setHasCard] = useState(false); // Mock: se o cliente tem cartão cadastrado

  const handleStartCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setCheckoutStep(1);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutNext = () => {
    if (checkoutStep === 1 && !indicator) {
      toast.error("Selecione quem te indicou.");
      return;
    }
    if (checkoutStep === 3 && !hasCard) {
      toast.error("Você precisa cadastrar um cartão de crédito.");
      return;
    }
    setCheckoutStep(prev => prev + 1);
  };

  const handleConfirmPurchase = () => {
    toast.success(`Contratação do Plano ${selectedPlan?.name} confirmada!`);
    setIsCheckoutOpen(false);
    setSelectedPlan(null);
    setCheckoutStep(1);
  };

  const renderCheckoutContent = () => {
    if (!selectedPlan) return null;

    switch (checkoutStep) {
      case 1: // Seleção de Indicador
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Quem te indicou?</h3>
            <div>
              <Label htmlFor="indicator">Profissional Indicador *</Label>
              <Select value={indicator} onValueChange={setIndicator}>
                <SelectTrigger id="indicator">
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {mockProfessionals.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2: // Serviços e Produtos
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. Detalhes do Plano</h3>
            <Card className="p-4 bg-muted/50">
              <CardTitle className="text-base mb-2">Serviços Inclusos:</CardTitle>
              <ul className="space-y-1 text-sm">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </span>
                    <Badge variant="secondary">100% OFF</Badge>
                  </li>
                ))}
                <li className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Produtos
                  </span>
                  <Badge variant="secondary">15% OFF</Badge>
                </li>
              </ul>
            </Card>
          </div>
        );
      case 3: // Pagamento
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">3. Pagamento</h3>
            {hasCard ? (
              <Card className="p-4 bg-green-50/50 border-green-200">
                <p className="font-medium">Cartão cadastrado:</p>
                <p className="text-sm text-muted-foreground">**** **** **** 1234 (Visa)</p>
              </Card>
            ) : (
              <Card className="p-4 bg-red-50/50 border-red-200 text-center space-y-3">
                <p className="text-red-600 font-medium">Você precisa cadastrar um cartão antes de continuar.</p>
                <Button variant="destructive" onClick={() => setHasCard(true)}>
                  Adicionar Cartão (Simulado)
                </Button>
              </Card>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Nossos Planos de Assinatura</h1>
        <p className="text-muted-foreground">
          Garanta benefícios exclusivos, descontos e serviços inclusos com nossos planos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPlans.map(plan => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 ${
                plan.is_popular ? 'border-primary shadow-glow' : 'hover:shadow-md'
              }`}
            >
              {plan.is_popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Mais Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <Crown className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-4xl font-bold text-foreground">R$ {plan.price.toFixed(2)}</span>
                  <span className="text-base text-muted-foreground">/{plan.billing_cycle}</span>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <div className="flex justify-between w-full text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Vigência: {plan.vigency}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Restam {plan.slots_remaining} vaga(s)</span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleStartCheckout(plan)}
                >
                  Contratar Plano
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <a href="#" className="text-xs text-muted-foreground hover:underline">Termos de Uso</a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contratar {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Complete os passos abaixo para finalizar a compra do seu plano.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {renderCheckoutContent()}
          </div>

          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setCheckoutStep(prev => Math.max(prev - 1, 1))}
              disabled={checkoutStep === 1}
            >
              Voltar
            </Button>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total:</p>
              <p className="text-xl font-bold text-primary">R$ {selectedPlan?.price.toFixed(2)}</p>
            </div>

            {checkoutStep < 3 ? (
              <Button onClick={handleCheckoutNext}>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleConfirmPurchase} disabled={!hasCard}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Compra
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
};

export default ClientPlans;