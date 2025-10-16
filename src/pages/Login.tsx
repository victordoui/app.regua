import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Crown, Scissors, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth(); // Removendo signUp temporariamente para simplificar o layout de login

  // Função de login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error, success } = await signIn(email, password);

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
      } else if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema!",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'barber' | 'admin') => {
    const loginEmail = role === 'barber' ? "barbeiro@naregua.com" : "admin@naregua.com";
    const loginPassword = role === 'barber' ? "barbeiro123456" : "admin123456";
    
    setEmail(loginEmail);
    setPassword(loginPassword);
    
    setTimeout(() => {
      handleLogin({ preventDefault: () => {} } as React.FormEvent);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 lg:p-0 relative overflow-hidden">
      {/* Background Pattern (similar to reference image) */}
      <div className="absolute inset-0 bg-primary/5 opacity-50">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-6xl h-[600px] bg-white shadow-2xl rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10">
        
        {/* Coluna Esquerda: Formulário de Login */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          
          {/* Logo no Formulário */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <Scissors className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">NA RÉGUA</h1>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Bem-vindo(a) ao Sistema!
          </h2>
          <p className="text-muted-foreground mb-6">
            Informe suas credenciais para acessar o sistema.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Informe o seu e-mail"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Informe sua senha"
                  className="pr-12 h-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
            
            <div className="text-right">
              <a href="#" className="text-sm text-primary hover:underline">
                Esqueceu sua senha?
              </a>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-600 text-primary-foreground font-semibold h-12 text-base shadow-lg transition-all duration-300 group"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  Acessando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Acessar
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </Button>
          </form>

          {/* Termos e Políticas */}
          <div className="text-center text-xs text-muted-foreground mt-8">
            <p>Ao continuar, você concorda com a 
              <a href="#" className="text-primary hover:underline ml-1">Política de Privacidade</a> e os 
              <a href="#" className="text-primary hover:underline ml-1">Termos de uso</a>.
            </p>
          </div>
        </div>

        {/* Coluna Direita: Destaque da Marca (Barber Flow) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-primary/5 text-foreground relative overflow-hidden">
          
          {/* Logo Grande */}
          <div className="mb-8 text-center">
            <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Scissors className="h-10 w-10 text-primary-foreground" />
            </div>
            <h3 className="text-4xl font-extrabold text-foreground tracking-tight">NA RÉGUA</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">BARBER FLOW SYSTEM</p>
          </div>

          {/* Mensagem de Destaque */}
          <div className="text-center max-w-sm">
            <h4 className="text-2xl font-bold text-foreground mb-4">
              O SISTEMA OFICIAL DA
            </h4>
            <h4 className="text-3xl font-extrabold text-primary tracking-tight">
              BARBEARIA POR ASSINATURA
            </h4>
          </div>
          
          {/* Quick Access Section (Mantido para desenvolvimento) */}
          <div className="absolute bottom-8 w-full px-12">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-primary/5 px-3 text-muted-foreground rounded-full backdrop-blur-sm">Acesso Rápido (Dev)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 h-10"
                onClick={() => handleQuickLogin('barber')}
              >
                <User className="h-4 w-4 mr-1" />
                Barbeiro
              </Button>
              
              <Button
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 h-10"
                onClick={() => handleQuickLogin('admin')}
              >
                <Crown className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;