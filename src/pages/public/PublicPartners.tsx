import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Briefcase } from 'lucide-react';

const PublicPartners = () => {
  const mockPartners = [
    { id: 1, name: 'Academia Fitness Pro', discount: '10% de desconto em mensalidades', logo: 'https://via.placeholder.com/100x100?text=FP' },
    { id: 2, name: 'Loja de Roupas Urbanas', discount: 'Voucher de R$ 50,00 em compras', logo: 'https://via.placeholder.com/100x100?text=UR' },
    { id: 3, name: 'Cafeteria Gourmet', discount: 'Café grátis no dia do seu corte', logo: 'https://via.placeholder.com/100x100?text=CG' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Empresas Parceiras</h1>
      <p className="text-muted-foreground">
        Aproveite os benefícios exclusivos que nossos parceiros oferecem.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {mockPartners.map(partner => (
          <Card key={partner.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{partner.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{partner.discount}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PublicPartners;