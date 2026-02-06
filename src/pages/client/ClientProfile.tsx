import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, LogOut, Loader2, Save, Camera } from 'lucide-react';
import { formatPhoneBR } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import MobileLayout from '@/components/mobile/MobileLayout';

interface BarbershopSettings {
  company_name: string;
  logo_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
}

interface ClientProfileData {
  full_name: string;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  address_cep: string | null;
  address_street: string | null;
  address_number: string | null;
  address_city: string | null;
  address_state: string | null;
  avatar_url: string | null;
}

const ClientProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<BarbershopSettings | null>(null);
  const [profile, setProfile] = useState<ClientProfileData>({
    full_name: '',
    phone: '',
    cpf: '',
    birth_date: '',
    address_cep: '',
    address_street: '',
    address_number: '',
    address_city: '',
    address_state: '',
    avatar_url: null,
  });
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(`/b/${userId}/login`);
        return;
      }

      setUserEmail(user.email || '');

      // Fetch barbershop settings
      const { data: settingsData } = await supabase
        .from('barbershop_settings')
        .select('company_name, logo_url, primary_color_hex, secondary_color_hex, is_public_page_enabled')
        .eq('user_id', userId)
        .single();

      if (settingsData?.is_public_page_enabled) {
        setSettings(settingsData as BarbershopSettings);
      }

      // Fetch client profile
      const { data: profileData } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          cpf: profileData.cpf || '',
          birth_date: profileData.birth_date || '',
          address_cep: profileData.address_cep || '',
          address_street: profileData.address_street || '',
          address_number: profileData.address_number || '',
          address_city: profileData.address_city || '',
          address_state: profileData.address_state || '',
          avatar_url: profileData.avatar_url,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [userId, navigate]);

  const handleSave = async () => {
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('client_profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone || null,
        cpf: profile.cpf || null,
        birth_date: profile.birth_date || null,
        address_cep: profile.address_cep || null,
        address_street: profile.address_street || null,
        address_number: profile.address_number || null,
        address_city: profile.address_city || null,
        address_state: profile.address_state || null,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message,
      });
    } else {
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`/b/${userId}/login`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Barbearia não encontrada</p>
        </Card>
      </div>
    );
  }

  return (
    <MobileLayout settings={settings}>
      <div className="px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback 
                    className="text-xl text-white"
                    style={{ backgroundColor: settings.primary_color_hex }}
                  >
                    {getInitials(profile.full_name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <button 
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: settings.primary_color_hex }}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-lg">{profile.full_name || 'Usuário'}</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 rounded-xl space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: settings.primary_color_hex }} />
              Dados Pessoais
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={userEmail}
                  disabled
                  className="h-12 bg-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: formatPhoneBR(e.target.value) })}
                    placeholder="(00)0000-0000"
                    inputMode="tel"
                    maxLength={14}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={profile.birth_date || ''}
                    onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={profile.cpf || ''}
                  onChange={(e) => setProfile({ ...profile, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="h-12"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 rounded-xl space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" style={{ color: settings.primary_color_hex }} />
              Endereço
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={profile.address_cep || ''}
                    onChange={(e) => setProfile({ ...profile, address_cep: e.target.value })}
                    placeholder="00000-000"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={profile.address_number || ''}
                    onChange={(e) => setProfile({ ...profile, address_number: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={profile.address_street || ''}
                  onChange={(e) => setProfile({ ...profile, address_street: e.target.value })}
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={profile.address_city || ''}
                    onChange={(e) => setProfile({ ...profile, address_city: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Input
                    id="state"
                    value={profile.address_state || ''}
                    onChange={(e) => setProfile({ ...profile, address_state: e.target.value })}
                    maxLength={2}
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Save Button */}
        <Button 
          className="w-full h-12"
          onClick={handleSave}
          disabled={saving}
          style={{ backgroundColor: settings.primary_color_hex }}
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>

        <Separator />

        {/* Logout */}
        <Button 
          variant="outline"
          className="w-full h-12 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </MobileLayout>
  );
};

export default ClientProfile;
