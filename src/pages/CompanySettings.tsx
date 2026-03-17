import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Settings, Palette, Link, Save, Image, Share2, Instagram, Facebook, MessageCircle, Smartphone, Copy, ExternalLink, CheckCircle, QrCode, Clock, AlertTriangle, Warehouse, Image as ImageIcon } from 'lucide-react';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { useCompanySettings, CompanySettingsFormData } from '@/hooks/useCompanySettings';
import { toast } from 'sonner';
import { formatPhoneBR } from '@/lib/utils';
import ImageUploadField from '@/components/ImageUploadField';
import { uploadFileToStorage } from '@/lib/supabaseStorage';
import { BusinessHoursEditor } from '@/components/settings/BusinessHoursEditor';
import { ColorPaletteSelector } from '@/components/settings/ColorPaletteSelector';
import { SeoMetaFields } from '@/components/settings/SeoMetaFields';

// Lazy imports for tab content
import InventoryContent from '@/components/business/InventoryContent';
import GalleryContent from '@/components/business/GalleryContent';

const CompanySettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const topTab = searchParams.get("tab") || "empresa";
  const { settings, isLoading, saveSettings, isSaving } = useCompanySettings();
  const [activeTab, setActiveTab] = useState("dados");
  
  const [formData, setFormData] = useState<CompanySettingsFormData>({
    company_name: '', slogan: '', primary_color_hex: '#0ea5e9', secondary_color_hex: '#1f2937',
    address: '', phone: '', email: '', is_public_page_enabled: true, logo_url: '', banner_url: '',
    instagram_url: '', facebook_url: '', whatsapp_number: '',
    cancellation_hours_before: 24, allow_online_cancellation: true, buffer_minutes: 0,
    noshow_fee_enabled: false, noshow_fee_amount: 0,
  });

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '', slogan: settings.slogan || '',
        primary_color_hex: settings.primary_color_hex || '#0ea5e9', secondary_color_hex: settings.secondary_color_hex || '#1f2937',
        address: settings.address || '', phone: settings.phone || '', email: settings.email || '',
        is_public_page_enabled: settings.is_public_page_enabled, logo_url: settings.logo_url || '', banner_url: settings.banner_url || '',
        instagram_url: settings.instagram_url || '', facebook_url: settings.facebook_url || '', whatsapp_number: settings.whatsapp_number || '',
        cancellation_hours_before: settings.cancellation_hours_before ?? 24, allow_online_cancellation: settings.allow_online_cancellation ?? true,
        buffer_minutes: settings.buffer_minutes ?? 0, noshow_fee_enabled: settings.noshow_fee_enabled ?? false, noshow_fee_amount: settings.noshow_fee_amount ?? 0,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name) { toast.error("O nome da empresa é obrigatório."); return; }
    await saveSettings(formData);
  };

  const clientBookingLink = settings?.user_id ? `${window.location.origin}/b/${settings.user_id}/login` : null;
  const handleCopyClientLink = () => { if (clientBookingLink) { navigator.clipboard.writeText(clientBookingLink); toast.success("Link copiado!"); } };
  const handleOpenClientLink = () => { if (clientBookingLink) window.open(clientBookingLink, '_blank'); };
  const handleShareWhatsApp = () => { if (clientBookingLink) { const msg = encodeURIComponent(`Agende seu horário em ${formData.company_name || 'nossa barbearia'}: ${clientBookingLink}`); window.open(`https://wa.me/?text=${msg}`, '_blank'); } };

  if (isLoading) return <Layout><div className="flex items-center justify-center h-64"><div className="text-lg">Carregando...</div></div></Layout>;

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Negócio</h1>
          <p className="text-muted-foreground">Empresa, estoque e galeria</p>
        </div>

        <Tabs value={topTab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList>
            <TabsTrigger value="empresa" className="flex items-center gap-2"><Building className="h-4 w-4" />Empresa</TabsTrigger>
            <TabsTrigger value="estoque" className="flex items-center gap-2"><Warehouse className="h-4 w-4" />Estoque</TabsTrigger>
            <TabsTrigger value="galeria" className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Galeria</TabsTrigger>
          </TabsList>

          <TabsContent value="empresa">
            <form id="company-settings-form" onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="dados" className="flex items-center gap-2"><Building className="h-4 w-4" />Dados</TabsTrigger>
                  <TabsTrigger value="identidade" className="flex items-center gap-2"><Palette className="h-4 w-4" />Visual</TabsTrigger>
                  <TabsTrigger value="link" className="flex items-center gap-2"><Smartphone className="h-4 w-4" />Link</TabsTrigger>
                </TabsList>

                <div className="flex items-center justify-end mb-4">
                  <Button type="submit" form="company-settings-form" disabled={isSaving} variant="secondary"><Save className="h-4 w-4 mr-2" />{isSaving ? "Salvando..." : "Salvar"}</Button>
                </div>

                <TabsContent value="dados" className="space-y-6 mt-0">
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Informações Básicas</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div><Label htmlFor="company_name">Nome *</Label><Input id="company_name" value={formData.company_name} onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))} required /></div>
                    <div><Label htmlFor="slogan">Slogan</Label><Input id="slogan" value={formData.slogan} onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))} /></div>
                    <div><Label htmlFor="address">Endereço</Label><Input id="address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="phone">Telefone</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhoneBR(e.target.value) }))} inputMode="tel" maxLength={14} /></div>
                      <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} /></div>
                    </div>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Status</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between"><Label>Página Ativa</Label><Switch checked={formData.is_public_page_enabled} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public_page_enabled: checked }))} /></div></CardContent></Card>
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Regras de Cancelamento</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><div><Label>Cancelamento Online</Label><p className="text-sm text-muted-foreground">Clientes podem cancelar</p></div><Switch checked={formData.allow_online_cancellation} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_online_cancellation: checked }))} /></div>
                    {formData.allow_online_cancellation && <div className="grid grid-cols-2 gap-4 pt-2"><div><Label>Antecedência (h)</Label><Input type="number" min="0" value={formData.cancellation_hours_before} onChange={(e) => setFormData(prev => ({ ...prev, cancellation_hours_before: parseInt(e.target.value) || 0 }))} /></div><div><Label>Buffer (min)</Label><Input type="number" min="0" value={formData.buffer_minutes} onChange={(e) => setFormData(prev => ({ ...prev, buffer_minutes: parseInt(e.target.value) || 0 }))} /></div></div>}
                    <div className="border-t pt-4"><div className="flex items-center justify-between"><div><Label className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Taxa No-Show</Label></div><Switch checked={formData.noshow_fee_enabled} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, noshow_fee_enabled: checked }))} /></div>{formData.noshow_fee_enabled && <div className="mt-3"><Label>Valor (R$)</Label><Input type="number" min="0" step="0.01" value={formData.noshow_fee_amount} onChange={(e) => setFormData(prev => ({ ...prev, noshow_fee_amount: parseFloat(e.target.value) || 0 }))} className="max-w-[200px]" /></div>}</div>
                  </CardContent></Card>
                  <BusinessHoursEditor />
                </TabsContent>

                <TabsContent value="identidade" className="space-y-6 mt-0">
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" />Imagens</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUploadField label="Logo" currentUrl={formData.logo_url} folder="logos" aspectRatio="square" onUploadSuccess={(url) => setFormData(prev => ({ ...prev, logo_url: url }))} uploadFile={uploadFileToStorage} />
                    <ImageUploadField label="Banner" currentUrl={formData.banner_url} folder="banners" aspectRatio="wide" onUploadSuccess={(url) => setFormData(prev => ({ ...prev, banner_url: url }))} uploadFile={uploadFileToStorage} />
                  </CardContent></Card>
                  <ColorPaletteSelector currentPrimary={formData.primary_color_hex} currentSecondary={formData.secondary_color_hex} onSelect={(p, s) => setFormData(prev => ({ ...prev, primary_color_hex: p, secondary_color_hex: s }))} />
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Cores</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4">
                    <div><Label>Cor Primária</Label><div className="flex items-center gap-2"><Input type="color" value={formData.primary_color_hex} onChange={(e) => setFormData(prev => ({ ...prev, primary_color_hex: e.target.value }))} className="w-12 h-10 p-0" /><Input type="text" value={formData.primary_color_hex} onChange={(e) => setFormData(prev => ({ ...prev, primary_color_hex: e.target.value }))} /></div></div>
                    <div><Label>Cor Secundária</Label><div className="flex items-center gap-2"><Input type="color" value={formData.secondary_color_hex} onChange={(e) => setFormData(prev => ({ ...prev, secondary_color_hex: e.target.value }))} className="w-12 h-10 p-0" /><Input type="text" value={formData.secondary_color_hex} onChange={(e) => setFormData(prev => ({ ...prev, secondary_color_hex: e.target.value }))} /></div></div>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" />Redes Sociais</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center gap-3"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80"><Instagram className="h-5 w-5 text-white" /></div><div className="flex-1"><Label>Instagram</Label><Input value={formData.instagram_url} onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))} placeholder="@seuperfil" /></div></div>
                    <div className="flex items-center gap-3"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600"><Facebook className="h-5 w-5 text-white" /></div><div className="flex-1"><Label>Facebook</Label><Input value={formData.facebook_url} onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))} /></div></div>
                    <div className="flex items-center gap-3"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500"><MessageCircle className="h-5 w-5 text-white" /></div><div className="flex-1"><Label>WhatsApp</Label><Input value={formData.whatsapp_number} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))} /></div></div>
                  </CardContent></Card>
                  <SeoMetaFields metaTitle={metaTitle} metaDescription={metaDescription} companyName={formData.company_name} onMetaTitleChange={setMetaTitle} onMetaDescriptionChange={setMetaDescription} />
                </TabsContent>

                <TabsContent value="link" className="space-y-6 mt-0">
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><Link className="h-5 w-5" />Link para Clientes</CardTitle></CardHeader><CardContent className="space-y-4">
                    {clientBookingLink ? <><div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">{clientBookingLink}</div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={handleCopyClientLink}><Copy className="h-4 w-4 mr-2" />Copiar</Button><Button type="button" variant="outline" onClick={handleOpenClientLink}><ExternalLink className="h-4 w-4 mr-2" />Abrir</Button><Button type="button" variant="outline" onClick={handleShareWhatsApp} className="text-green-600"><MessageCircle className="h-4 w-4 mr-2" />WhatsApp</Button></div></> : <p className="text-muted-foreground">Salve primeiro para gerar o link.</p>}
                  </CardContent></Card>
                  {clientBookingLink && <QRCodeGenerator url={clientBookingLink} companyName={formData.company_name || 'Sua Barbearia'} />}
                </TabsContent>
              </Tabs>
            </form>
          </TabsContent>

          <TabsContent value="estoque"><InventoryContent /></TabsContent>
          <TabsContent value="galeria"><GalleryContent /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CompanySettings;
