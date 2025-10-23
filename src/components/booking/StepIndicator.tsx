import React from 'react';
import { Check, LucideIcon } from 'lucide-react';
import { STEPS } from '@/types/booking'; // Mantendo importação original para compatibilidade

interface StepItem {
  id: number;
  name: string;
  icon?: LucideIcon;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: StepItem[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((item, index) => (
        <React.Fragment key={item.id}>
          <div className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                item.id <= currentStep 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              {item.id < currentStep ? <Check className="h-5 w-5" /> : item.id}
            </div>
            <span className={`text-xs mt-2 text-center transition-colors ${
              item.id <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}>
              {item.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div 
              className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                item.id < currentStep ? 'bg-primary' : 'bg-border'
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;