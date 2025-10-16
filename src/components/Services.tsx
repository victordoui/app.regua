import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, Zap, Crown, Clock, Star } from "lucide-react";

const Services = () => {
  const services = [
    {
      id: 1,
      name: "Corte Clássico",
      description: "Corte tradicional masculino com acabamento perfeito e lavagem.",
      price: "R$ 35",
      duration: "30 min",
      icon: Scissors,
      popular: false,
      features: ["Lavagem", "Finalização", "Styling"]
    },
    {
      id: 2,
      name: "Corte + Barba",
      description: "Combo completo com corte moderno e barba alinhada.",
      price: "R$ 55",
      duration: "50 min",
      icon: Zap,
      popular: true,
      features: ["Lavagem", "Corte", "Barba", "Hidratação"]
    },
    {
      id: 3,
      name: "Pacote Premium",
      description: "Experiência completa: corte, barba, sobrancelha e relaxamento.",
      price: "R$ 85",
      duration: "80 min",
      icon: Crown,
      popular: false,
      features: ["Tudo incluso", "Massagem", "Tratamento", "Bebida"]
    }
  ];

  return (
    <section id="servicos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Nossos Serviços
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Experiência Premium
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada serviço é uma experiência única, pensada nos mínimos detalhes 
            para garantir o melhor resultado e sua total satisfação.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={service.id} 
                className={`relative transition-all duration-300 hover:shadow-elegant hover:scale-105 ${
                  service.popular ? 'border-primary shadow-glow' : ''
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="text-3xl font-bold text-primary">{service.price}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    variant={service.popular ? "barber" : "barber-outline"} 
                    className="w-full"
                  >
                    Agendar {service.name}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Não encontrou o que procura? Entre em contato conosco!
          </p>
          <Button variant="barber-outline" size="lg">
            Ver Todos os Serviços
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;