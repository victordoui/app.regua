import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Scissors, Users, Clock, CalendarClock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
}

interface OnboardingProgressProps {
  currentStep: number;
  completedSteps: number[];
}

const STEPS: Step[] = [
  { id: 1, title: 'Empresa', icon: <Building2 className="h-5 w-5" /> },
  { id: 2, title: 'Serviços', icon: <Scissors className="h-5 w-5" /> },
  { id: 3, title: 'Barbeiros', icon: <Users className="h-5 w-5" /> },
  { id: 4, title: 'Horários', icon: <Clock className="h-5 w-5" /> },
  { id: 5, title: 'Turnos', icon: <CalendarClock className="h-5 w-5" /> },
];

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  completedSteps,
}) => {
  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isPending = !isCompleted && !isCurrent;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "bg-primary/10 border-primary text-primary",
                    isPending && "bg-muted border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                  {isCurrent && (
                    <motion.div
                      layoutId="active-step"
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isCurrent && "text-primary",
                    isCompleted && "text-primary",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "h-full origin-left",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                    style={{ 
                      backgroundColor: isCompleted ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
