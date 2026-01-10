import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Settings, Palette, Link, Save, Image, Eye, Share2, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { useCompanySettings, CompanySettingsFormData } from '@/hooks/useCompanySettings';
import { toast } from 'sonner';
import CompanyPagePreview from '@/components/CompanyPagePreview';
import ImageUploadField from '@/components/ImageUploadField';
import { uploadFileToStorage } from '@/lib/supabaseStorage';

const CompanySettings = () => {
  const { settings, isLoading, saveSettings, isSaving } = useCompanySettings();
  const [activeTab, setActiveTab] = useState("dados");
  
  const [formData, setFormData] = useState<CompanySettingsFormData>({
    company_name: '',
    slogan: '',
    primary_color_hex: '#0ea5e9',
    secondary_color_hex: '#1f2937',
    address: '',
    phone: '',
    email: '',
    is_public_page_enabled: true,
    logo_url: '',
    banner_url: '',
    instagram_url: '',
    facebook_url: '',
    whatsapp_number: '',
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
        logo_url: settings.logo_url || '',
        banner_url: settings.banner_url || '',
        instagram_url: settings.instagram_url || '',
        facebook_url: settings.facebook_url || '',
        whatsapp_number: settings.whatsapp_number || '',
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
    const publicUrl = `${window.location.origin}/public-booking/${settings?.user_id || 'seu-id'}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link da página pública copiado!");
  };

  const handleViewPage = () => {
    if (settings?.user_id) {
      const publicUrl = `${window.location.origin}/public-booking/${settings.user_id}`;
      window.open(publicUrl, '_blank');
    } else {
      toast.error("Salve as configurações primeiro para gerar o link.");
    }
  };

  const publicLink = settings?.user_id 
    ? `${window.location.origin}/public-booking/${settings.user_id}`
    : 'Salve para gerar o link';

  const getTabTitle = () => {
    return activeTab === "dados" ? "Dados da Empresa" : "Identidade Visual";
  };

  const getTabDescription = () => {
    return activeTab === "dados" 
      ? "Gerencie as informações básicas e de contato da sua empresa."
      : "Personalize a aparência visual da sua página pública.";
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
        <form id="company-settings-form" onSubmit={handleSubmit}>
          {/* Tabs no topo */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="dados" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Dados da Empresa
              </TabsTrigger>
              <TabsTrigger value="identidade" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Identidade Visual
              </TabsTrigger>
            </TabsList>

            {/* Header dinâmico */}
            <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm py-4 border-b border-border -mx-6 px-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{getTabTitle()}</h1>
                  <p className="text-sm text-muted-foreground">{getTabDescription()}</p>
                  {activeTab === "identidade" && (
                    <p className="text-xs text-primary mt-1">
                      Link Público: <span className="font-mono">{publicLink}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {activeTab === "identidade" && settings?.user_id && (
                    <>
                      <Button type="button" variant="outline" onClick={handleCopyLink}>
                        <Link className="h-4 w-4 mr-2" />
                        Copiar Link
                      </Button>
                      <Button type="button" onClick={handleViewPage} variant="default">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Página
                      </Button>
                    </>
                  )}
                  <Button type="submit" form="company-settings-form" disabled={isSaving} variant="secondary">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar Tudo"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Aba Dados da Empresa */}
            <TabsContent value="dados" className="space-y-6 mt-0">
              {/* Informações Básicas */}
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
                    <Label htmlFor="slogan">Slogan / Dizeres da Barbearia</Label>
                    <Input
                      id="slogan"
                      value={formData.slogan}
                      onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                      placeholder="Ex: Sempre Na Régua"
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

              {/* Status da Página */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public-page-switch">Página de Agendamento Ativa</Label>
                    <Switch
                      id="public-page-switch"
                      checked={formData.is_public_page_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public_page_enabled: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Identidade Visual */}
            <TabsContent value="identidade" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna de Configurações (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customização de Imagens */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Imagens da Página Pública
                      </CardTitle>
                      <CardDescription>
                        Faça upload da logo e do banner para personalizar sua página de agendamento.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ImageUploadField
                        label="Logo / Imagem de Perfil"
                        currentUrl={formData.logo_url}
                        folder="logos"
                        aspectRatio="square"
                        onUploadSuccess={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                        uploadFile={uploadFileToStorage}
                      />
                      <ImageUploadField
                        label="Banner / Imagem de Capa"
                        currentUrl={formData.banner_url}
                        folder="banners"
                        aspectRatio="wide"
                        onUploadSuccess={(url) => setFormData(prev => ({ ...prev, banner_url: url }))}
                        uploadFile={uploadFileToStorage}
                      />
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

                  {/* Redes Sociais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Redes Sociais
                      </CardTitle>
                      <CardDescription>
                        Adicione links das redes sociais para exibir na página pública.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                          <Instagram className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="instagram_url">Instagram</Label>
                          <Input 
                            id="instagram_url"
                            placeholder="@seuperfil ou https://instagram.com/seuperfil"
                            value={formData.instagram_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
                          <Facebook className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="facebook_url">Facebook</Label>
                          <Input 
                            id="facebook_url"
                            placeholder="https://facebook.com/suapagina"
                            value={formData.facebook_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500">
                          <MessageCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="whatsapp_number">WhatsApp</Label>
                          <Input 
                            id="whatsapp_number"
                            placeholder="(11) 99999-9999"
                            value={formData.whatsapp_number}
                            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Coluna de Preview (1/3) - Só na aba Identidade Visual */}
                <div className="lg:col-span-1">
                  <div className="sticky top-28">
                    <CompanyPagePreview data={formData} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </Layout>
  );
};

export default CompanySettings;
