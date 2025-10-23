import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, DollarSign, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PublicPlans = () => {
  const mockPlans = [
    {
      id: 1,
      name: 'Plano Básico',
      description: 'Acesso a agendamentos e descontos pontuais.',
      price: 0,
      cycle: 'Grátis',
      features: ['Agendamento Online', 'Notificações'],
      popular: false,
    },
    {
      id: 2,
      name: 'VIP Mensal',
      description: 'Experiência premium com créditos e prioridade.',
      price: 99.90,
      cycle: 'mês',
      features: ['2 Cortes/mês', '1 Barba Grátis', '15% Off em Produtos', 'Prioridade'],
      popular: true,
    },
    {
      id: 3,
      name: 'Anual Gold',
      description: 'Economize e garanta seu estilo o ano todo.',
      price: 999.00,
      cycle: 'ano',
      features: ['Acesso Ilimitado', 'Todos os serviços inclusos', '20% Off em Produtos', 'Presente Exclusivo'],
      popular: false,
    },
  ];

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

              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full" disabled={plan.price === 0}>
                {plan.price === 0 ? 'Plano Atual' : 'Contratar Plano'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PublicPlans;