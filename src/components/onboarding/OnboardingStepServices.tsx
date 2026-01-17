import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scissors, Plus, Trash2, Sparkles, Check } from 'lucide-react';
import { SERVICE_TEMPLATES } from '@/hooks/useOnboarding';

interface Service {
  id?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

interface OnboardingStepServicesProps {
  services: Service[];
  onAddService: (service: Omit<Service, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

export const OnboardingStepServices: React.FC<OnboardingStepServicesProps> = ({
  services,
  onAddService,
  isLoading,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
  });
  const [addedTemplates, setAddedTemplates] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    await onAddService({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
    });

    setFormData({ name: '', description: '', price: '', duration: '30' });
    setShowForm(false);
  };

  const handleAddTemplate = async (template: typeof SERVICE_TEMPLATES[0]) => {
    if (addedTemplates.includes(template.name)) return;
    
    await onAddService({
      name: template.name,
      description: template.description,
      price: template.price,
      duration: template.duration,
    });
    
    setAddedTemplates(prev => [...prev, template.name]);
  };

  const isTemplateAdded = (name: string) => {
    return addedTemplates.includes(name) || services.some(s => s.name === name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Serviços Oferecidos</CardTitle>
          <CardDescription>
            Adicione os serviços que sua barbearia oferece
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Templates rápidos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Adicionar rapidamente
            </div>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TEMPLATES.slice(0, 6).map((template) => {
                const added = isTemplateAdded(template.name);
                return (
                  <Button
                    key={template.name}
                    variant={added ? "secondary" : "outline"}
                    size="sm"
                    disabled={added || isLoading}
                    onClick={() => handleAddTemplate(template)}
                    className="gap-1"
                  >
                    {added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {template.name}
                    <span className="text-muted-foreground ml-1">R${template.price}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Serviços adicionados */}
          {services.length > 0 && (
            <div className="space-y-3">
              <Label>Serviços cadastrados ({services.length})</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id || index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.duration}min
                        </p>
                      </div>
                      <Badge variant="secondary">
                        R$ {service.price.toFixed(2)}
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Formulário manual */}
          {showForm ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 p-4 rounded-lg border bg-muted/30"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_name">Nome do serviço</Label>
                  <Input
                    id="service_name"
                    placeholder="Ex: Corte Navalhado"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_price">Preço (R$)</Label>
                  <Input
                    id="service_price"
                    type="number"
                    step="0.01"
                    placeholder="45.00"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_duration">Duração (minutos)</Label>
                <Input
                  id="service_duration"
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || !formData.name || !formData.price}>
                  Adicionar
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </motion.form>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar serviço personalizado
            </Button>
          )}

          {services.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Adicione pelo menos 1 serviço para continuar
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingStepServices;
