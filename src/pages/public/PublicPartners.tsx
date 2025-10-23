import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Handshake, Briefcase, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PublicPartners = () => {
  const mockPartners = [
    { 
      id: 1, 
      name: 'Academia Fitness Pro', 
      description: 'Mantenha o corpo em dia com descontos exclusivos.',
      discount: '10% de desconto em mensalidades', 
      benefit: 'Apresente seu comprovante de agendamento.',
      logo: 'https://via.placeholder.com/100x100?text=FP' 
    },
    { 
      id: 2, 
      name: 'Loja de Roupas Urbanas', 
      description: 'Renove seu estilo com as últimas tendências.',
      discount: 'Voucher de R$ 50,00 em compras', 
      benefit: 'Use o código BARBER50 no checkout.',
      logo: 'https://via.placeholder.com/100x100?text=UR' 
    },
    { 
      id: 3, 
      name: 'Cafeteria Gourmet', 
      description: 'O melhor café da cidade para começar o dia.',
      discount: 'Café grátis no dia do seu corte', 
      benefit: 'Válido apenas no dia do seu agendamento.',
      logo: 'https://via.placeholder.com/100x100?text=CG' 
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Empresas Parceiras</h1>
      <p className="text-muted-foreground">
        Aproveite os benefícios exclusivos que nossos parceiros oferecem.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {mockPartners.map(partner => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                  <CardDescription>{partner.description}</CardDescription>
                </div>
              </div>
              
              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <Tag className="h-4 w-4 flex-shrink-0" />
                  {partner.discount}
                </div>
                <p className="text-xs text-muted-foreground">
                  **Como resgatar:** {partner.benefit}
                </p>
              </div>
              
              <Button variant="link" className="p-0 h-auto text-sm">
                Visitar Site <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PublicPartners;