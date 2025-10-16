import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Instagram, Facebook, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-secondary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Na Régua" className="h-12 w-12" />
              <div>
                <h3 className="text-2xl font-bold">Na Régua</h3>
                <p className="text-sm text-primary-foreground/80">Barbearia Premium</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Há mais de 10 anos cuidando do seu estilo com excelência. 
              Experiência premium em cortes masculinos, barba e tratamentos.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm text-primary-foreground/80">
                  <p>Rua dos Barbeiros, 123</p>
                  <p>Centro - São Paulo/SP</p>
                  <p>CEP: 01234-567</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm text-primary-foreground/80">(11) 99999-9999</span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Funcionamento</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Horários</span>
              </div>
              
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <div className="flex justify-between">
                  <span>Segunda - Sexta</span>
                  <span>9h às 19h</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado</span>
                  <span>9h às 17h</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <span className="text-primary">Fechado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 Na Régua Barbearia. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/60">
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-primary-foreground transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;