import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Building, Settings, Palette, Link, Save } from 'lucide-react';
import { useCompanySettings, CompanySettingsFormData } from '@/hooks/useCompanySettings';
import { toast } from 'sonner';

const CompanySettings = () => {
  const { settings, isLoading, saveSettings, isSaving } = useCompanySettings();
  
  const [formData, setFormData] = useState<CompanySettingsFormData>({
    company_name: '',
    slogan: '',
    primary_color_hex: '#0ea5e9',
    secondary_color_hex: '#1f2937',
    address: '',
    phone: '',
    email: '',
    is_public_page_enabled: true,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        slogan: settings.slogan || '',
        primary_color_hex: settings.primary_color_hex || '#0ea5e9',
        secondary_color_hex: settings.secondary_color_hex || '#1f2937',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        is_public_page_enabled: settings.is_public_page_enabled,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name) {
      toast.error("O nome da empresa é obrigatório.");
      return;
    }
    await saveSettings(formData);
  };

  const handleCopyLink = () => {
    // Mock URL for demonstration. In a real app, this would be a dynamic URL.
    const publicUrl = `${window.location.origin}/public-booking/${settings?.user_id || 'seu-id'}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link da página pública copiado!");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando configurações da empresa...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dados da Empresa</h1>
            <p className="text-muted-foreground">
              Gerencie informações básicas e a página pública de agendamento.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configurações da Página Pública */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Página Pública de Agendamento
              </CardTitle>
              <CardDescription>
                Configure a página que seus clientes verão para agendar serviços.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="public-page-switch">Página Ativa</Label>
                <Switch
                  id="public-page-switch"
                  checked={formData.is_public_page_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public_page_enabled: checked }))}
                />
              </div>
              {settings?.user_id && (
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={`${window.location.origin}/public-booking/${settings.user_id}`}
                    className="bg-muted"
                  />
                  <Button type="button" variant="outline" onClick={handleCopyLink}>
                    Copiar Link
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan / Dizeres da Barbearia</Label>
                <Input
                  id="slogan"
                  value={formData.slogan}
                  onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                  placeholder="Ex: Sempre Na Régua"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Nome da Barbearia *</Label>
                <Input 
                  id="company_name" 
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Na Régua Barbearia"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua dos Barbeiros, 123"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customização de Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Customização de Cores
              </CardTitle>
              <CardDescription>
                Defina as cores primária e secundária para a sua página pública.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_color_hex">Cor Primária</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary_color_hex"
                    type="color"
                    value={formData.primary_color_hex}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color_hex: e.target.value }))}
                    className="w-12 h-10 p-0"
                  />
                  <Input
                    type="text"
                    value={formData.primary_color_hex}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color_hex: e.target.value }))}
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary_color_hex">Cor Secundária</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary_color_hex"
                    type="color"
                    value={formData.secondary_color_hex}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color_hex: e.target.value }))}
                    className="w-12 h-10 p-0"
                  />
                  <Input
                    type="text"
                    value={formData.secondary_color_hex}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color_hex: e.target.value }))}
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default CompanySettings;