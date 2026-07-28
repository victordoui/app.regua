import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Facebook,
  Image as ImageIcon,
  Instagram,
  Link,
  MessageCircle,
  Palette,
  Save,
  Share2,
  Smartphone,
  Warehouse,
} from "lucide-react";
import Layout from "@/components/Layout";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import ImageUploadField from "@/components/ImageUploadField";
import InventoryContent from "@/components/business/InventoryContent";
import GalleryContent from "@/components/business/GalleryContent";
import { BusinessHoursEditor } from "@/components/settings/BusinessHoursEditor";
import { ColorPaletteSelector } from "@/components/settings/ColorPaletteSelector";
import { SeoMetaFields } from "@/components/settings/SeoMetaFields";
import { Button } from "@/components/ui/button";
import { FieldHelp, FormSection } from "@/components/ui/form-section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { SectionTabsLayout } from "@/components/ui/section-tabs";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useCompanySettings, type CompanySettingsFormData } from "@/hooks/useCompanySettings";
import { uploadFileToStorage } from "@/lib/supabaseStorage";
import { formatPhoneBR } from "@/lib/utils";
import { toast } from "sonner";

const tabAliases: Record<string, string> = {
  dados: "informacoes",
  identidade: "aparencia",
  link: "agendamento",
};

const navigationItems = [
  { value: "informacoes", label: "Informações", description: "Dados e contato", icon: Building },
  { value: "aparencia", label: "Aparência", description: "Logo, capa e cores", icon: Palette },
  { value: "agendamento", label: "Página de agendamento", description: "Link para seus clientes", icon: Smartphone },
  { value: "funcionamento", label: "Funcionamento", description: "Horários e regras", icon: Clock },
  { value: "estoque", label: "Estoque", description: "Produtos e quantidades", icon: Warehouse },
  { value: "galeria", label: "Galeria", description: "Fotos do negócio", icon: ImageIcon },
] as const;

const initialFormData: CompanySettingsFormData = {
  company_name: "",
  slogan: "",
  primary_color_hex: "#0ea5e9",
  secondary_color_hex: "#1f2937",
  address: "",
  phone: "",
  email: "",
  is_public_page_enabled: true,
  logo_url: "",
  banner_url: "",
  instagram_url: "",
  facebook_url: "",
  whatsapp_number: "",
  cancellation_hours_before: 24,
  allow_online_cancellation: true,
  buffer_minutes: 0,
  noshow_fee_enabled: false,
  noshow_fee_amount: 0,
};

const CompanySettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") || "informacoes";
  const currentTab = tabAliases[rawTab] || rawTab;
  const { settings, isLoading, saveSettings, isSaving } = useCompanySettings();
  const [formData, setFormData] = useState<CompanySettingsFormData>(initialFormData);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    if (!settings) return;
    setFormData({
      company_name: settings.company_name || "",
      slogan: settings.slogan || "",
      primary_color_hex: settings.primary_color_hex || "#0ea5e9",
      secondary_color_hex: settings.secondary_color_hex || "#1f2937",
      address: settings.address || "",
      phone: settings.phone || "",
      email: settings.email || "",
      is_public_page_enabled: settings.is_public_page_enabled,
      logo_url: settings.logo_url || "",
      banner_url: settings.banner_url || "",
      instagram_url: settings.instagram_url || "",
      facebook_url: settings.facebook_url || "",
      whatsapp_number: settings.whatsapp_number || "",
      cancellation_hours_before: settings.cancellation_hours_before ?? 24,
      allow_online_cancellation: settings.allow_online_cancellation ?? true,
      buffer_minutes: settings.buffer_minutes ?? 0,
      noshow_fee_enabled: settings.noshow_fee_enabled ?? false,
      noshow_fee_amount: settings.noshow_fee_amount ?? 0,
    });
  }, [settings]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formData.company_name.trim()) {
      toast.error("Informe o nome da empresa antes de salvar.");
      return;
    }
    await saveSettings(formData);
  };

  const clientBookingLink = settings?.user_id
    ? `${window.location.origin}/b/${settings.user_id}/login`
    : null;

  const handleCopyClientLink = async () => {
    if (!clientBookingLink) return;
    await navigator.clipboard.writeText(clientBookingLink);
    toast.success("Link copiado. Agora você já pode enviar aos clientes.");
  };

  const handleOpenClientLink = () => {
    if (clientBookingLink) window.open(clientBookingLink, "_blank");
  };

  const handleShareWhatsApp = () => {
    if (!clientBookingLink) return;
    const message = encodeURIComponent(`Agende seu horário em ${formData.company_name || "nossa barbearia"}: ${clientBookingLink}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const showsSaveAction = ["informacoes", "aparencia", "agendamento", "funcionamento"].includes(currentTab);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[360px] items-center justify-center text-base font-medium text-muted-foreground">
          Carregando informações da empresa...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer className="max-w-[1380px]">
        <PageHeader
          eyebrow="Meu negócio"
          icon={<Building className="h-5 w-5" />}
          title="Minha Empresa"
          subtitle="Configure como sua empresa funciona e como ela aparece para seus clientes."
        >
          {clientBookingLink && (
            <Button type="button" variant="outline" onClick={handleOpenClientLink} className="min-h-11">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver página do cliente
            </Button>
          )}
        </PageHeader>

        <div className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo da empresa" className="h-full w-full object-cover" />
              ) : (
                <Building className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{formData.company_name || "Sua empresa"}</p>
              <p className="text-sm font-medium text-muted-foreground">
                Use o menu abaixo para alterar cada parte do seu negócio.
              </p>
            </div>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-bold ${formData.is_public_page_enabled ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
            <CheckCircle2 className="h-4 w-4" />
            Página {formData.is_public_page_enabled ? "ativa" : "desativada"}
          </div>
        </div>

        <form id="company-settings-form" onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={(value) => setSearchParams({ tab: value })}>
            <SectionTabsLayout items={navigationItems} navigationTitle="O que você quer configurar?">
                <TabsContent value="informacoes" className="mt-0 space-y-6">
                  <FormSection
                    icon={<Building className="h-5 w-5" />}
                    title="Informações da empresa"
                    description="Dados básicos usados nos agendamentos e no contato com seus clientes."
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label htmlFor="company_name" className="text-sm font-bold">Nome da empresa *</Label>
                        <Input id="company_name" className="mt-2 min-h-11 bg-background" value={formData.company_name} onChange={(event) => setFormData((previous) => ({ ...previous, company_name: event.target.value }))} required />
                        <FieldHelp>Este nome será mostrado para seus clientes.</FieldHelp>
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="slogan" className="text-sm font-bold">Frase da empresa</Label>
                        <Input id="slogan" className="mt-2 min-h-11 bg-background" value={formData.slogan} onChange={(event) => setFormData((previous) => ({ ...previous, slogan: event.target.value }))} placeholder="Ex.: Aqui cuidamos da sua imagem" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="address" className="text-sm font-bold">Endereço</Label>
                        <Input id="address" className="mt-2 min-h-11 bg-background" value={formData.address} onChange={(event) => setFormData((previous) => ({ ...previous, address: event.target.value }))} placeholder="Rua, número, bairro e cidade" />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-bold">Telefone</Label>
                        <Input id="phone" className="mt-2 min-h-11 bg-background" value={formData.phone} onChange={(event) => setFormData((previous) => ({ ...previous, phone: formatPhoneBR(event.target.value) }))} inputMode="tel" maxLength={14} placeholder="(00) 00000-0000" />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-bold">E-mail</Label>
                        <Input id="email" type="email" className="mt-2 min-h-11 bg-background" value={formData.email} onChange={(event) => setFormData((previous) => ({ ...previous, email: event.target.value }))} placeholder="contato@suaempresa.com" />
                      </div>
                    </div>
                  </FormSection>

                  <FormSection
                    icon={<Share2 className="h-5 w-5" />}
                    title="Redes sociais"
                    description="Facilite para que os clientes encontrem e falem com sua empresa."
                  >
                    <div className="grid gap-5 md:grid-cols-3">
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-bold"><Instagram className="h-4 w-4 text-primary" />Instagram</Label>
                        <Input className="mt-2 min-h-11 bg-background" value={formData.instagram_url} onChange={(event) => setFormData((previous) => ({ ...previous, instagram_url: event.target.value }))} placeholder="@seuperfil" />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-bold"><Facebook className="h-4 w-4 text-primary" />Facebook</Label>
                        <Input className="mt-2 min-h-11 bg-background" value={formData.facebook_url} onChange={(event) => setFormData((previous) => ({ ...previous, facebook_url: event.target.value }))} placeholder="facebook.com/seuperfil" />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-bold"><MessageCircle className="h-4 w-4 text-primary" />WhatsApp</Label>
                        <Input className="mt-2 min-h-11 bg-background" value={formData.whatsapp_number} onChange={(event) => setFormData((previous) => ({ ...previous, whatsapp_number: event.target.value }))} placeholder="(00) 00000-0000" />
                      </div>
                    </div>
                  </FormSection>
                </TabsContent>

                <TabsContent value="aparencia" className="mt-0 space-y-6">
                  <FormSection
                    icon={<ImageIcon className="h-5 w-5" />}
                    title="Logo e imagem de capa"
                    description="Estas imagens aparecem no painel e na página vista pelos clientes."
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <ImageUploadField label="Logo da empresa" currentUrl={formData.logo_url} folder="logos" aspectRatio="square" onUploadSuccess={(url) => setFormData((previous) => ({ ...previous, logo_url: url }))} uploadFile={uploadFileToStorage} />
                      <ImageUploadField label="Imagem de capa" currentUrl={formData.banner_url} folder="banners" aspectRatio="wide" onUploadSuccess={(url) => setFormData((previous) => ({ ...previous, banner_url: url }))} uploadFile={uploadFileToStorage} />
                    </div>
                  </FormSection>

                  <ColorPaletteSelector currentPrimary={formData.primary_color_hex} currentSecondary={formData.secondary_color_hex} onSelect={(primary, secondary) => setFormData((previous) => ({ ...previous, primary_color_hex: primary, secondary_color_hex: secondary }))} />

                  <FormSection
                    icon={<Palette className="h-5 w-5" />}
                    title="Cores personalizadas"
                    description="Use somente se quiser ajustar manualmente as cores da página do cliente."
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label className="text-sm font-bold">Cor principal</Label>
                        <div className="mt-2 flex gap-2">
                          <Input type="color" value={formData.primary_color_hex} onChange={(event) => setFormData((previous) => ({ ...previous, primary_color_hex: event.target.value }))} className="h-11 w-14 shrink-0 bg-background p-1" />
                          <Input value={formData.primary_color_hex} onChange={(event) => setFormData((previous) => ({ ...previous, primary_color_hex: event.target.value }))} className="min-h-11 bg-background" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-bold">Cor secundária</Label>
                        <div className="mt-2 flex gap-2">
                          <Input type="color" value={formData.secondary_color_hex} onChange={(event) => setFormData((previous) => ({ ...previous, secondary_color_hex: event.target.value }))} className="h-11 w-14 shrink-0 bg-background p-1" />
                          <Input value={formData.secondary_color_hex} onChange={(event) => setFormData((previous) => ({ ...previous, secondary_color_hex: event.target.value }))} className="min-h-11 bg-background" />
                        </div>
                      </div>
                    </div>
                  </FormSection>

                  <SeoMetaFields metaTitle={metaTitle} metaDescription={metaDescription} companyName={formData.company_name} onMetaTitleChange={setMetaTitle} onMetaDescriptionChange={setMetaDescription} />
                </TabsContent>

                <TabsContent value="agendamento" className="mt-0 space-y-6">
                  <FormSection
                    icon={<Smartphone className="h-5 w-5" />}
                    title="Página de agendamento"
                    description="Ative ou pause a página usada pelos seus clientes para marcar horários."
                  >
                    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Label className="text-base font-bold">Aceitar agendamentos pela internet</Label>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">Quando estiver ativa, clientes poderão acessar o link e escolher um horário.</p>
                      </div>
                      <Switch checked={formData.is_public_page_enabled} onCheckedChange={(checked) => setFormData((previous) => ({ ...previous, is_public_page_enabled: checked }))} />
                    </div>
                  </FormSection>

                  <FormSection
                    icon={<Link className="h-5 w-5" />}
                    title="Link para seus clientes"
                    description="Copie, abra ou envie este endereço pelo WhatsApp."
                  >
                    {clientBookingLink ? (
                      <>
                        <div className="break-all rounded-xl border border-border bg-muted/70 p-4 font-mono text-sm font-semibold text-foreground">{clientBookingLink}</div>
                        <div className="flex flex-wrap gap-3">
                          <Button type="button" onClick={handleCopyClientLink} className="min-h-11"><Copy className="mr-2 h-4 w-4" />Copiar link</Button>
                          <Button type="button" variant="outline" onClick={handleOpenClientLink} className="min-h-11"><ExternalLink className="mr-2 h-4 w-4" />Abrir página</Button>
                          <Button type="button" variant="outline" onClick={handleShareWhatsApp} className="min-h-11"><MessageCircle className="mr-2 h-4 w-4" />Enviar no WhatsApp</Button>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                        Salve as informações da empresa para gerar o link de agendamento.
                      </div>
                    )}
                  </FormSection>
                  {clientBookingLink && <QRCodeGenerator url={clientBookingLink} companyName={formData.company_name || "Sua empresa"} />}
                </TabsContent>

                <TabsContent value="funcionamento" className="mt-0 space-y-6">
                  <BusinessHoursEditor />
                  <FormSection
                    icon={<Clock className="h-5 w-5" />}
                    title="Regras de cancelamento"
                    description="Defina com quanto tempo o cliente pode cancelar e o intervalo entre atendimentos."
                  >
                    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Label className="text-base font-bold">Permitir cancelamento pela internet</Label>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">O cliente poderá cancelar sem precisar entrar em contato.</p>
                      </div>
                      <Switch checked={formData.allow_online_cancellation} onCheckedChange={(checked) => setFormData((previous) => ({ ...previous, allow_online_cancellation: checked }))} />
                    </div>
                    {formData.allow_online_cancellation && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <Label className="text-sm font-bold">Antecedência para cancelar</Label>
                          <div className="mt-2 flex items-center gap-2"><Input type="number" min="0" value={formData.cancellation_hours_before} onChange={(event) => setFormData((previous) => ({ ...previous, cancellation_hours_before: Number.parseInt(event.target.value) || 0 }))} className="min-h-11 bg-background" /><span className="font-medium text-muted-foreground">horas</span></div>
                        </div>
                        <div>
                          <Label className="text-sm font-bold">Intervalo entre atendimentos</Label>
                          <div className="mt-2 flex items-center gap-2"><Input type="number" min="0" value={formData.buffer_minutes} onChange={(event) => setFormData((previous) => ({ ...previous, buffer_minutes: Number.parseInt(event.target.value) || 0 }))} className="min-h-11 bg-background" /><span className="font-medium text-muted-foreground">minutos</span></div>
                        </div>
                      </div>
                    )}
                    <div className="border-t border-border pt-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <Label className="flex items-center gap-2 text-base font-bold"><AlertTriangle className="h-5 w-5 text-amber-500" />Cobrar taxa por ausência</Label>
                          <p className="mt-1 text-sm font-medium text-muted-foreground">Use esta opção quando o cliente não comparecer ao horário marcado.</p>
                        </div>
                        <Switch checked={formData.noshow_fee_enabled} onCheckedChange={(checked) => setFormData((previous) => ({ ...previous, noshow_fee_enabled: checked }))} />
                      </div>
                      {formData.noshow_fee_enabled && (
                        <div className="mt-4 max-w-xs">
                          <Label className="text-sm font-bold">Valor da taxa</Label>
                          <Input type="number" min="0" step="0.01" value={formData.noshow_fee_amount} onChange={(event) => setFormData((previous) => ({ ...previous, noshow_fee_amount: Number.parseFloat(event.target.value) || 0 }))} className="mt-2 min-h-11 bg-background" />
                        </div>
                      )}
                    </div>
                  </FormSection>
                </TabsContent>

                <TabsContent value="estoque" className="mt-0"><InventoryContent /></TabsContent>
                <TabsContent value="galeria" className="mt-0"><GalleryContent /></TabsContent>
            </SectionTabsLayout>

            {showsSaveAction && (
              <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
                <div className="rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur">
                  <Button type="submit" form="company-settings-form" disabled={isSaving} className="min-h-11 px-5 text-sm font-bold">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Salvando alterações..." : "Salvar alterações"}
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </form>
      </PageContainer>
    </Layout>
  );
};

export default CompanySettings;
