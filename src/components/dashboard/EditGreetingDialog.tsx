import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import ImageUploadField from "@/components/ImageUploadField";
import { uploadFileToStorage } from "@/lib/supabaseStorage";
import { Loader2 } from "lucide-react";

interface EditGreetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditGreetingDialog: React.FC<EditGreetingDialogProps> = ({ open, onOpenChange }) => {
  const { settings, saveSettings, isSaving } = useCompanySettings();
  const [companyName, setCompanyName] = useState("");
  const [slogan, setSlogan] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  useEffect(() => {
    if (open && settings) {
      setCompanyName(settings.company_name || "");
      setSlogan(settings.slogan || "");
      setLogoUrl(settings.logo_url || "");
      setBannerUrl(settings.banner_url || "");
    }
  }, [open, settings]);

  const handleSave = async () => {
    if (!settings) return;
    await saveSettings({
      company_name: companyName,
      slogan,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      primary_color_hex: settings.primary_color_hex,
      secondary_color_hex: settings.secondary_color_hex,
      address: settings.address || "",
      phone: settings.phone || "",
      email: settings.email || "",
      is_public_page_enabled: settings.is_public_page_enabled,
      instagram_url: settings.instagram_url || "",
      facebook_url: settings.facebook_url || "",
      whatsapp_number: settings.whatsapp_number || "",
      cancellation_hours_before: settings.cancellation_hours_before,
      allow_online_cancellation: settings.allow_online_cancellation,
      buffer_minutes: settings.buffer_minutes,
      noshow_fee_enabled: settings.noshow_fee_enabled,
      noshow_fee_amount: settings.noshow_fee_amount,
      onboarding_completed: settings.onboarding_completed,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar saudação</DialogTitle>
          <DialogDescription>
            Personalize o nome, subtítulo, logo e imagem de capa do dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="greet-name">Nome de saudação</Label>
            <Input
              id="greet-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: Marshalls Barber"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="greet-subtitle">Subtítulo</Label>
            <Input
              id="greet-subtitle"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ex: Bem-vindo de volta!"
            />
            <p className="text-xs text-muted-foreground">
              Se vazio, mostra o resumo de agendamentos do dia.
            </p>
          </div>

          <ImageUploadField
            label="Logo"
            currentUrl={logoUrl}
            folder="logos"
            onUploadSuccess={setLogoUrl}
            uploadFile={uploadFileToStorage}
            aspectRatio="square"
          />

          <ImageUploadField
            label="Imagem de capa"
            currentUrl={bannerUrl}
            folder="banners"
            onUploadSuccess={setBannerUrl}
            uploadFile={uploadFileToStorage}
            aspectRatio="wide"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGreetingDialog;
