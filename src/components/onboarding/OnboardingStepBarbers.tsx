import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, User } from 'lucide-react';
import { formatPhoneBR, formatNameOnly } from '@/lib/utils';

interface Barber {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

interface OnboardingStepBarbersProps {
  barbers: Barber[];
  onAddBarber: (barber: Omit<Barber, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

export const OnboardingStepBarbers: React.FC<OnboardingStepBarbersProps> = ({
  barbers,
  onAddBarber,
  isLoading,
}) => {
  const [showForm, setShowForm] = useState(barbers.length === 0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    await onAddBarber({
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
    });

    setFormData({ name: '', email: '', phone: '' });
    setShowForm(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Barbeiros</CardTitle>
          <CardDescription>
            Cadastre os profissionais da sua equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Barbeiros cadastrados */}
          {barbers.length > 0 && (
            <div className="space-y-3">
              <Label>Equipe ({barbers.length})</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {barbers.map((barber, index) => (
                    <motion.div
                      key={barber.id || index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(barber.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{barber.name}</p>
                        {(barber.email || barber.phone) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {barber.phone || barber.email}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Formulário */}
          {showForm ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 p-4 rounded-lg border bg-muted/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Novo Barbeiro</p>
                  <p className="text-xs text-muted-foreground">
                    Preencha os dados do profissional
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barber_name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="barber_name"
                  placeholder="Nome do barbeiro"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: formatNameOnly(e.target.value) }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barber_phone">Telefone</Label>
                  <Input
                    id="barber_phone"
                    placeholder="(00)0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhoneBR(e.target.value) }))}
                    inputMode="tel"
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barber_email">E-mail</Label>
                  <Input
                    id="barber_email"
                    type="email"
                    placeholder="barbeiro@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || !formData.name}>
                  Adicionar
                </Button>
                {barbers.length > 0 && (
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </motion.form>
          ) : (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              Adicionar barbeiro
            </Button>
          )}

          {barbers.length === 0 && !showForm && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Adicione pelo menos 1 barbeiro para continuar
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingStepBarbers;
