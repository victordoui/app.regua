import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Globe, MessageSquare } from "lucide-react";

interface SeoMetaFieldsProps {
  metaTitle: string;
  metaDescription: string;
  companyName: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
}

export const SeoMetaFields = ({
  metaTitle,
  metaDescription,
  companyName,
  onMetaTitleChange,
  onMetaDescriptionChange,
}: SeoMetaFieldsProps) => {
  const displayTitle = metaTitle || `${companyName} - Agendamento Online`;
  const displayDescription = metaDescription || `Agende seu horário na ${companyName}. Serviços de qualidade com profissionais especializados.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          SEO e Meta Tags
        </CardTitle>
        <CardDescription>
          Otimize como sua página aparece em buscadores e redes sociais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Título da Página (Meta Title)
            </Label>
            <Input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              placeholder={`${companyName} - Agendamento Online`}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {metaTitle.length}/60 caracteres (recomendado: até 60)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Descrição (Meta Description)
            </Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder={`Agende seu horário na ${companyName}. Serviços de qualidade com profissionais especializados.`}
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {metaDescription.length}/160 caracteres (recomendado: até 160)
            </p>
          </div>
        </div>

        {/* Google Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview no Google</Label>
          <div className="p-4 bg-card border rounded-lg space-y-1">
            <p className="text-lg text-blue-600 hover:underline cursor-pointer truncate">
              {displayTitle}
            </p>
            <p className="text-sm text-green-700 truncate">
              appnaregua.lovable.app/b/...
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {displayDescription}
            </p>
          </div>
        </div>

        {/* WhatsApp Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview no WhatsApp</Label>
          <div className="p-3 bg-[#dcf8c6] rounded-lg max-w-xs">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Globe className="h-12 w-12 text-primary/40" />
              </div>
              <div className="p-3 space-y-1">
                <p className="text-xs text-muted-foreground truncate">
                  appnaregua.lovable.app
                </p>
                <p className="text-sm font-medium truncate">
                  {displayTitle}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {displayDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
