import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Store, User, LogOut } from "lucide-react";
import Layout from "@/components/Layout";
import { formatPhoneBR } from "@/lib/utils";

const Settings = () => {
  const handleSignOut = () => {
    // Como não há mais autenticação, apenas redireciona
    window.location.href = "/";
  };

  return (
    <Layout>
      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm md:text-base text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Dados da Barbearia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Barbearia</Label>
              <Input id="name" defaultValue="Na Régua" />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" defaultValue="Rua das Barbearias, 123" />
            </div>
            <div>
             <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" defaultValue="(11)9999-9999" inputMode="tel" maxLength={14} />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" placeholder="Seu nome" />
            </div>
            <div>
              <Label htmlFor="userPhone">Telefone</Label>
              <Input id="userPhone" placeholder="(00)0000-0000" inputMode="tel" maxLength={14} />
            </div>
            <div className="flex gap-2">
              <Button>Atualizar Perfil</Button>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </Layout>
  );
};

export default Settings;