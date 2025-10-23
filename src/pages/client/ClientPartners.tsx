import React from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Gift, Tag } from 'lucide-react';

interface Partner {
  id: number;
  name: string;
  description: string;
  advantage: string;
  coupon_code: string;
}

const mockPartners: Partner[] = [
  {
    id: 1,
    name: "Cafeteria Premium",
    description: "Desconto em cafés e lanches artesanais.",
    advantage: "15% OFF em qualquer pedido.",
    coupon_code: "NAREGUA15",
  },
  {
    id: 2,
    name: "Loja de Roupas Masculinas",
    description: "Moda casual e social de alta qualidade.",
    advantage: "R$ 50 de desconto em compras acima de R$ 200.",
    coupon_code: "NAREGUA50",
  },
  {
    id: 3,
    name: "Academia Fitness",
    description: "Planos de treino com foco em resultados.",
    advantage: "Primeiro mês grátis.",
    coupon_code: "NAREGUA_FIT",
  },
];

const ClientPartners = () => {
  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Empresas Parceiras</h1>
        <p className="text-muted-foreground">
          Aproveite benefícios e descontos exclusivos com nossos parceiros.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPartners.map(partner => (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-5 w-5 text-primary" />
                  {partner.name}
                </CardTitle>
                <CardDescription>{partner.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <Gift className="h-4 w-4" />
                  {partner.advantage}
                </div>
                <div className="border border-dashed p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Código de Resgate:</p>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-lg text-foreground">{partner.coupon_code}</span>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(partner.coupon_code);
                        toast.success("Código copiado!");
                      }}
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientPartners;