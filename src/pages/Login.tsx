import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Crown, Scissors } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  // Função de login unificada
  const handleLogin = async (e?: React.FormEvent, loginEmail?: string, loginPassword?: string) => {
    e?.preventDefault();
    
    const finalEmail = loginEmail || email;
    const finalPassword = loginPassword || password;

    if (!finalEmail || !finalPassword) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error, success } = await signIn(finalEmail, finalPassword);

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        });
      } else if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vendo ao sistema!",
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

  // Cadastro de novo usuário
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error, success } = await signUp(email, password, fullName);

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message || "Não foi possível criar o usuário",
          variant: "destructive",
        });
      } else if (success) {
        toast({
          title: "Usuário criado com sucesso!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
        // Limpar formulário
        setEmail("");
        setPassword("");
        setFullName("");
        // Mudar para tab de login após cadastro
        setActiveTab("login");
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
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
    
    // 1. Preenche os campos (para feedback visual)
    setEmail(loginEmail);
    setPassword(loginPassword);
    
    // 2. Submete o login diretamente
    // Usamos setTimeout para garantir que o estado (email/password) seja atualizado antes de chamar handleLogin
    setTimeout(() => {
      handleLogin(undefined, loginEmail, loginPassword);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-black via-barber-dark to-barber-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background with barber theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Floating barber elements */}
      <div className="absolute top-10 left-10 animate-float">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
      </div>
      <div className="absolute top-20 right-20 animate-float-delay-2">
        <div className="w-3 h-3 bg-secondary rounded-full"></div>
      </div>
      <div className="absolute bottom-20 left-20 animate-float-delay-4">
        <div className="w-2 h-2 bg-accent rounded-full"></div>
      </div>
      <div className="absolute bottom-10 right-10 animate-float-delay-6">
        <div className="w-4 h-4 bg-primary rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section com ícone */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Scissors className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground">Na Régua</h1>
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="bg-card/95 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
          
          <CardHeader className="text-center pb-6 relative">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-primary mr-2" />
              <h2 className="text-2xl font-bold text-foreground">Bem-vindo de Volta</h2>
            </div>
            <CardDescription className="text-muted-foreground text-base">
              Acesse sua conta para gerenciar sua barbearia
            </CardDescription>
          </CardHeader>

          <CardContent className="relative">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm border-border">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-primary text-primary-foreground data-[state=inactive]:text-foreground data-[state=inactive]:bg-muted/50 transition-all duration-300"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-primary text-primary-foreground data-[state=inactive]:text-foreground data-[state=inactive]:bg-muted/50 transition-all duration-300"
                >
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6 mt-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-12 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                        className="pl-12 pr-12 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 h-12"
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

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Entrar no Sistema
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Quick Access Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-muted px-3 text-muted-foreground rounded-full backdrop-blur-sm">OU</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 h-10"
                      onClick={() => handleQuickLogin('barber')}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Barbeiro
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 h-10"
                      onClick={() => handleQuickLogin('admin')}
                    >
                      <Crown className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-5 mt-6">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground font-medium">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground font-medium">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-12 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground font-medium">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Crie uma senha forte"
                        className="pl-12 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300 h-12"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                        Cadastrando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Criar Conta
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm mt-8">
          <p className="mb-2">© 2024 Na Régua - Todos os direitos reservados</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs">Sistema de Gestão Barbearia</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delay-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-delay-4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        @keyframes float-delay-6 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delay-2 {
          animation: float-delay-2 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        .animate-float-delay-4 {
          animation: float-delay-4 3s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-delay-6 {
          animation: float-delay-6 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
};

export default Login;