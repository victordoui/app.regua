import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scissors, Building2, Users, Clock, CalendarClock, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingWelcomeProps {
  onStart: () => void;
}

const FEATURES = [
  { icon: Building2, label: 'Dados da empresa' },
  { icon: Scissors, label: 'Serviços oferecidos' },
  { icon: Users, label: 'Cadastro de barbeiros' },
  { icon: Clock, label: 'Horários de funcionamento' },
  { icon: CalendarClock, label: 'Escalas de trabalho' },
];

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-4"
    >
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg"
          >
            <Scissors className="h-10 w-10 text-primary-foreground" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Bem-vindo ao Na Régua
            </h1>
            <p className="text-muted-foreground mb-8">
              Vamos configurar sua barbearia em 5 passos simples.
              <br />
              <span className="text-sm">Leva menos de 5 minutos!</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-8"
          >
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  <feature.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{feature.label}</span>
                {index === 4 && (
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    opcional
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button 
              onClick={onStart} 
              size="lg" 
              className="w-full gap-2 text-lg h-12 shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="h-5 w-5" />
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingWelcome;
