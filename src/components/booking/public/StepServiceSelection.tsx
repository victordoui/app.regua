import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClientBookingForm, PublicService } from '@/types/publicBooking';
import { Clock, DollarSign, Scissors, Package, Sparkles } from 'lucide-react';
import { ServiceCombo, calculateComboPrice } from '@/hooks/useServiceCombos';

interface StepServiceSelectionProps {
  formData: ClientBookingForm;
  setFormData: React.Dispatch<React.SetStateAction<ClientBookingForm>>;
  services: PublicService[];
  combos?: ServiceCombo[];
  selectedComboId?: string;
  onSelectCombo?: (comboId: string | null) => void;
}

const StepServiceSelection: React.FC<StepServiceSelectionProps> = ({ 
  formData, 
  setFormData, 
  services,
  combos = [],
  selectedComboId,
  onSelectCombo 
}) => {
  const handleToggleService = (serviceId: string) => {
    // If a combo is selected, deselect it when user picks individual services
    if (selectedComboId && onSelectCombo) {
      onSelectCombo(null);
    }
    
    setFormData(prev => {
      const currentServices = prev.selectedServices;
      if (currentServices.includes(serviceId)) {
        return { ...prev, selectedServices: currentServices.filter(id => id !== serviceId) };
      } else {
        return { ...prev, selectedServices: [...currentServices, serviceId] };
      }
    });
  };

  const handleSelectCombo = (combo: ServiceCombo) => {
    if (onSelectCombo) {
      if (selectedComboId === combo.id) {
        // Deselect combo
        onSelectCombo(null);
        setFormData(prev => ({ ...prev, selectedServices: [] }));
      } else {
        // Select combo and its services
        onSelectCombo(combo.id);
        const serviceIds = combo.services?.map(s => s.id) || [];
        setFormData(prev => ({ ...prev, selectedServices: serviceIds }));
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Filter only active combos with at least 2 services
  const activeCombos = combos.filter(c => c.active && c.services && c.services.length >= 2);

  return (
    <div className="space-y-6">
      {/* Combos Section */}
      {activeCombos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Combos Recomendados</h3>
            <Badge variant="secondary" className="text-xs">Economia</Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {activeCombos.map((combo) => {
              const pricing = combo.services 
                ? calculateComboPrice(combo.services, combo.discount_type, combo.discount_value)
                : null;
              const isSelected = selectedComboId === combo.id;
              const totalDuration = combo.services?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

              return (
                <div
                  key={combo.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectCombo(combo)}
                >
                  <div className="flex items-start gap-4">
                    {/* Imagem do combo */}
                    {combo.image_url ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={combo.image_url} 
                          alt={combo.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-base">{combo.name}</h4>
                          {combo.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{combo.description}</p>
                          )}
                        </div>
                        <Badge className="bg-green-500 text-white flex-shrink-0">
                          {combo.discount_type === 'percentage' 
                            ? `-${combo.discount_value}%` 
                            : `-${formatCurrency(combo.discount_value)}`}
                        </Badge>
                      </div>

                      {/* Serviços inclusos */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {combo.services?.map(s => (
                          <Badge key={s.id} variant="outline" className="text-xs">
                            {s.name}
                          </Badge>
                        ))}
                      </div>

                      {/* Preço e duração */}
                      {pricing && (
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{totalDuration} min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="line-through text-muted-foreground text-xs">
                              {formatCurrency(pricing.originalPrice)}
                            </span>
                            <span className="font-bold text-primary text-base">
                              {formatCurrency(pricing.finalPrice)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Services Section */}
      <div className="space-y-3">
        {activeCombos.length > 0 && (
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Serviços Individuais</h3>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4">
          {services.map((service) => {
            const isSelected = formData.selectedServices.includes(service.id);
            const isPartOfCombo = selectedComboId && combos.find(c => c.id === selectedComboId)?.services?.some(s => s.id === service.id);
            
            return (
              <div
                key={service.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50'
                } ${isPartOfCombo ? 'opacity-60' : ''}`}
                onClick={() => !isPartOfCombo && handleToggleService(service.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Imagem do serviço */}
                  {service.image_url ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={service.image_url} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Scissors className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <Checkbox
                    id={service.id}
                    checked={isSelected}
                    onCheckedChange={() => !isPartOfCombo && handleToggleService(service.id)}
                    className="mt-1"
                    disabled={!!isPartOfCombo}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={service.id} className="font-semibold text-base cursor-pointer">
                      {service.name}
                    </Label>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-primary">
                        <DollarSign className="h-4 w-4" />
                        <span>R$ {service.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepServiceSelection;