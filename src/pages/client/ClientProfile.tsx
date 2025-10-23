import React, { useState, useEffect } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Phone, Mail, Calendar, Lock, MapPin, Save, Upload, Google } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileFormData {
  fullName: string;
  phone: string;
  dob: string; // Date of Birth
  cpf: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
}

const ClientProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user?.user_metadata?.full_name || '',
    phone: '',
    dob: '',
    cpf: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock: Simula o preenchimento inicial de dados
  useEffect(() => {
    if (user) {
      // Simulação de fetch de dados do perfil (que não estão no auth.user)
      setFormData(prev => ({
        ...prev,
        phone: '(11) 98765-4321',
        dob: '1990-01-01',
        cpf: '123.456.789-00',
        cep: '01001-000',
        street: 'Rua Exemplo',
        number: '100',
        city: 'São Paulo',
        state: 'SP',
      }));
    }
  }, [user]);

  const handleCepLookup = async () => {
    if (formData.cep.length !== 9) return;
    setLoading(true);
    try {
      // Simulação de ViaCEP
      await new Promise(resolve => setTimeout(resolve, 500));
      setFormData(prev => ({
        ...prev,
        street: 'Rua da Simulação',
        city: 'Cidade Teste',
        state: 'TS',
        bairro: 'Bairro Central',
      }));
      toast.success("Endereço preenchido automaticamente!");
    } catch (error) {
      toast.error("CEP não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulação de salvamento no Supabase (profiles table)
    setTimeout(() => {
      toast.success("Perfil atualizado com sucesso!");
      setLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  const getUserInitials = () => {
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie seus dados pessoais e de acesso.</p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Foto de Perfil e Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Dados Pessoais
              </CardTitle>
              <CardDescription>
                Estes dados são usados para identificação e contato.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" /> Alterar Foto
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} required />
                </div>
                <div>
                  <Label htmlFor="dob">Data de Nascimento *</Label>
                  <Input id="dob" type="date" value={formData.dob} onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input id="cpf" value={formData.cpf} onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))} required placeholder="000.000.000-00" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input id="cep" value={formData.cep} onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))} onBlur={handleCepLookup} required placeholder="00000-000" />
                </div>
                <div>
                  <Label htmlFor="street">Rua</Label>
                  <Input id="street" value={formData.street} onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))} required disabled={loading} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="number">Número *</Label>
                  <Input id="number" value={formData.number} onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))} required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" value={formData.complement} onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} required disabled={loading} />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" value={formData.state} onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} required disabled={loading} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input id="newPassword" type="password" placeholder="Deixe em branco para não alterar" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirme a nova senha" />
              </div>
              <Button type="button" variant="outline">Vincular Login com Google</Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
};

export default ClientProfile;