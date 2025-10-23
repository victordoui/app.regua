import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StepPaywallProps {
  onContinue: () => void;
  planStatus: 'none' | 'basic' | 'premium';
}

const StepPaywall: React.FC<StepPaywallProps> = ({ onContinue, planStatus }) => {
  const navigate = useNavigate();
  
  const isUpgradeNeeded = planStatus === 'none' || planStatus === 'basic';

  if (!isUpgradeNeeded) {
    // Se o cliente já tem um plano premium, continua automaticamente
    return null; 
  }

  return (
    <Card className="border-primary/50 bg-primary/5 shadow-lg p-6 text-center space-y-6">
      <Crown className="h-12 w-12 text-primary mx-auto" />
      <h2 className="text-2xl font-bold text-foreground">
        Desbloqueie Benefícios Exclusivos!
      </h2>
      <p className="text-lg text-muted-foreground max-w-md mx-auto">
        Faça um upgrade para um de nossos planos e garanta descontos exclusivos, serviços inclusos e agendamento prioritário.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="default" 
          size="lg"
          onClick={() => navigate('/client/plans')}
        >
          <Crown className="h-5 w-5 mr-2" />
          Quero conferir os planos
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={onContinue}
        >
          Não tenho interesse
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
};

export default StepPaywall;