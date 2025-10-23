import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Calendar, MapPin, Save, Lock, Image, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const PublicProfile = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: 'Cliente Teste',
    email: 'cliente@teste.com',
    phone: '(11) 98765-4321',
    birthDate: '1990-01-01',
    cpf: '123.456.789-00',
    cep: '01001-000',
    street: 'Rua Exemplo',
    number: '100',
    complement: 'Apto 1',
    city: 'São Paulo',
    state: 'SP',
    newPassword: '',
    confirmPassword: '',
    avatarUrl: '', // Mock URL
  });
  const [loading, setLoading] = useState(false);

  const handleCepLookup = async () => {
    // Remove non-numeric characters for API call
    const cleanCep = formData.cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast({ title: "Erro", description: "CEP inválido.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Simulação de chamada ViaCEP
      const mockAddress = {
        street: 'Rua dos Barbeiros',
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'Centro',
      };
      setFormData(prev => ({
        ...prev,
        street: mockAddress.street,
        city: mockAddress.city,
        state: mockAddress.state,
        // Bairro não está no mock, mas seria preenchido
      }));
      toast({ title: "CEP preenchido com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao buscar CEP", description: "Verifique o CEP digitado.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de salvamento
    toast({ title: "Perfil atualizado com sucesso!" });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    // Simulação de alteração de senha
    toast({ title: "Senha alterada com sucesso!" });
    setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Meu Perfil</h1>
      <p className="text-muted-foreground">
        Gerencie seus dados pessoais e endereço.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de Foto e Segurança */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Foto de Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="object-cover" />
                ) : (
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {getInitials(formData.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Alterar Foto
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input id="newPassword" type="password" value={formData.newPassword} onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Dados Pessoais e Endereço */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input id="cpf" value={formData.cpf} onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))} placeholder="000.000.000-00" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Dados Pessoais
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="cep" 
                      value={formData.cep} 
                      onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))} 
                      placeholder="00000-000" 
                      required 
                    />
                    <Button type="button" variant="outline" onClick={handleCepLookup} disabled={loading}>
                      {loading ? "Buscando..." : "Buscar CEP"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="street">Rua *</Label>
                  <Input id="street" value={formData.street} onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input id="number" value={formData.number} onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" value={formData.complement} onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input id="city" value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} required />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input id="state" value={formData.state} onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Endereço
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;