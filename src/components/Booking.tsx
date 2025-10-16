import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, Phone, Check } from "lucide-react";

const Booking = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: ""
  });

  const services = [
    { id: "corte", name: "Corte Clássico", price: "R$ 35", duration: "30 min" },
    { id: "combo", name: "Corte + Barba", price: "R$ 55", duration: "50 min" },
    { id: "premium", name: "Pacote Premium", price: "R$ 85", duration: "80 min" }
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Agendamento Online
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Agende Seu Horário
            </h2>
            <p className="text-lg text-muted-foreground">
              Processo simples e rápido em apenas 3 etapas
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    stepNumber <= step 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stepNumber < step ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div 
                    className={`w-16 h-1 mx-2 transition-colors ${
                      stepNumber < step ? 'bg-primary' : 'bg-muted'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === 1 && <><User className="h-5 w-5" /> Escolha o Serviço</>}
                {step === 2 && <><Clock className="h-5 w-5" /> Selecione o Horário</>}
                {step === 3 && <><Calendar className="h-5 w-5" /> Seus Dados</>}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Selecione o serviço que deseja agendar"}
                {step === 2 && "Escolha o melhor horário para você"}
                {step === 3 && "Complete seu agendamento"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Step 1: Service Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedService === service.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.duration}</p>
                        </div>
                        <div className="text-lg font-bold text-primary">{service.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2: Time Selection */}
              {step === 2 && (
                <div>
                  <div className="mb-4">
                    <Label className="text-base font-medium">Horários Disponíveis - Hoje</Label>
                    <p className="text-sm text-muted-foreground">Clique no horário desejado</p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "barber" : "barber-outline"}
                        className="h-12"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Customer Data */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Resumo do Agendamento</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Serviço:</span> {services.find(s => s.id === selectedService)?.name}</p>
                      <p><span className="font-medium">Horário:</span> Hoje às {selectedTime}</p>
                      <p><span className="font-medium">Valor:</span> {services.find(s => s.id === selectedService)?.price}</p>
                    </div>
                  </div>

                  {/* Customer Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                        placeholder="Digite seu nome"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">WhatsApp</Label>
                      <Input
                        id="phone"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button 
                  variant="barber-outline" 
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Voltar
                </Button>
                
                {step < 3 ? (
                  <Button 
                    variant="barber"
                    onClick={nextStep}
                    disabled={
                      (step === 1 && !selectedService) || 
                      (step === 2 && !selectedTime)
                    }
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button 
                    variant="barber"
                    disabled={!customerData.name || !customerData.phone}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Confirmar via WhatsApp
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Booking;