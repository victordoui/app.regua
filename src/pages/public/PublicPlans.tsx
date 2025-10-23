import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, DollarSign, Clock, Star, User, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const PublicPlans = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [hasCard, setHasCard] = useState(false); // Mock: se o cliente tem cartão cadastrado

  const mockPlans = [
    {
      id: 1,
      name: 'Plano Básico',
      description: 'Acesso a agendamentos e descontos pontuais.',
      price: 0,
      cycle: 'Grátis',
      features: ['Agendamento Online', 'Notificações'],
      popular: false,
      vagas: 'Ilimitadas',
      servicos_inclusos: [{ name: 'Agendamento', discount: '100% OFF' }],
    },
    {
      id: 2,
      name: 'VIP Mensal',
      description: 'Experiência premium com créditos e prioridade.',
      price: 99.90,
      cycle: 'mês',
      features: ['2 Cortes/mês', '1 Barba Grátis', '15% Off em Produtos', 'Prioridade'],
      popular: true,
      vagas: 'Restam 5',
      servicos_inclusos: [
        { name: 'Corte', discount: '100% OFF (2x)' },
        { name: 'Barba', discount: '100% OFF (1x)' },
        { name: 'Produtos', discount: '15% OFF' },
      ],
    },
    {
      id: 3,
      name: 'Anual Gold',
      description: 'Economize e garanta seu estilo o ano todo.',
      price: 999.00,
      cycle: 'ano',
      features: ['Acesso Ilimitado', 'Todos os serviços inclusos', '20% Off em Produtos', 'Presente Exclusivo'],
      popular: false,
      vagas: 'Restam 2',
      servicos_inclusos: [
        { name: 'Todos os Serviços', discount: '100% OFF' },
        { name: 'Produtos', discount: '20% OFF' },
      ],
    },
  ];

  const mockProfessionals = [
    { id: 'p1', name: 'Carlos Silva' },
    { id: 'p2', name: 'Ana Souza' },
    { id: 'p3', name: 'Roberto Mendes' },
  ];

  const handleContract = (plan: any) => {
    setSelectedPlan(plan);
    setCheckoutStep(1);
    setIsCheckoutOpen(true);
  };

  const handleNextStep = () => {
    if (checkoutStep === 1 && !selectedProfessional) {
      toast.error("Selecione quem vendeu o plano.");
      return;
    }
    if (checkoutStep === 2 && !hasCard) {
      toast.error("Você precisa cadastrar um cartão antes de continuar.");
      return;
    }
    setCheckoutStep(prev => prev + 1);
  };

  const handleConfirmPurchase = () => {
    toast.success(`Compra do plano ${selectedPlan.name} confirmada!`);
    setIsCheckoutOpen(false);
  };

  const renderCheckoutContent = () => {
    if (!selectedPlan) return null;

    switch (checkoutStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Seleção de Indicador</h3>
            <div>
              <Label htmlFor="professional">Quem vendeu? *</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional">
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {mockProfessionals.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <h3 className="text-lg font-semibold pt-4 border-t">Detalhes do Plano</h3>
            <div className="space-y-2">
              {selectedPlan.servicos_inclusos.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <Badge variant="secondary">{item.discount}</Badge>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. Pagamento</h3>
            {!hasCard ? (
              <Card className="border-red-500/50 bg-red-500/5">
                <CardContent className="p-4 text-center space-y-3">
                  <CreditCard className="h-8 w-8 text-red-500 mx-auto" />
                  <p className="text-sm font-medium text-red-700">
                    Você precisa cadastrar um cartão antes de continuar.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={() => toast.info("Simulação: Redirecionando para cadastro de cartão.")}
                  >
                    Adicionar Cartão
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Cartão Selecionado:</p>
                <Card className="p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>**** **** **** 1234</span>
                    <Badge variant="default">Visa</Badge>
                  </div>
                </Card>
                <Button variant="link" className="p-0 h-auto">Alterar Cartão</Button>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Confirmação Final</h3>
            <p className="text-muted-foreground">
              Você está prestes a contratar o plano <span className="font-semibold text-primary">{selectedPlan.name}</span> por R$ {selectedPlan.price.toFixed(2).replace('.', ',')}/{selectedPlan.cycle}.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nossos Planos de Assinatura</h1>
      <p className="text-muted-foreground">
        Faça um upgrade e garanta benefícios exclusivos e descontos.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {mockPlans.map(plan => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-300 ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                <Star className="h-3 w-3 mr-1" /> Mais Popular
              </Badge>
            )}
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-primary">
                  {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2).replace('.', ',')}`}
                </span>
                {plan.price > 0 && <span className="text-sm text-muted-foreground">/{plan.cycle}</span>}
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                {plan.vagas}
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full" 
                disabled={plan.price === 0}
                onClick={() => handleContract(plan)}
              >
                {plan.price === 0 ? 'Plano Atual' : 'Contratar Plano'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contratar {selectedPlan?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {renderCheckoutContent()}
          </div>

          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCheckoutStep(prev => Math.max(1, prev - 1))}
              disabled={checkoutStep === 1}
            >
              Voltar
            </Button>
            
            {checkoutStep < 3 ? (
              <Button onClick={handleNextStep}>
                Próximo
              </Button>
            ) : (
              <Button onClick={handleConfirmPurchase}>
                Confirmar Compra
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicPlans;