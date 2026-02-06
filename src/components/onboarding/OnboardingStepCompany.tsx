import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2 } from 'lucide-react';
import { formatPhoneBR } from '@/lib/utils';

interface CompanyFormData {
  company_name: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
}

interface OnboardingStepCompanyProps {
  data: CompanyFormData;
  onChange: (data: Partial<CompanyFormData>) => void;
}

export const OnboardingStepCompany: React.FC<OnboardingStepCompanyProps> = ({
  data,
  onChange,
}) => {
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
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Dados da Empresa</CardTitle>
          <CardDescription>
            Informe os dados básicos da sua barbearia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">
              Nome da Barbearia <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company_name"
              placeholder="Ex: Barbearia do João"
              value={data.company_name}
              onChange={(e) => onChange({ company_name: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan (opcional)</Label>
            <Input
              id="slogan"
              placeholder="Ex: O melhor corte da cidade"
              value={data.slogan}
              onChange={(e) => onChange({ slogan: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              placeholder="Rua, número, bairro, cidade - UF"
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00)0000-0000"
                value={data.phone}
                onChange={(e) => onChange({ phone: formatPhoneBR(e.target.value) })}
                className="h-12"
                inputMode="tel"
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@barbearia.com"
                value={data.email}
                onChange={(e) => onChange({ email: e.target.value })}
                className="h-12"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingStepCompany;
