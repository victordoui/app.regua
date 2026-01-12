import { useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Copy, ExternalLink, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  url: string;
  companyName?: string;
}

const QRCodeGenerator = ({ url, companyName = 'Sua Barbearia' }: QRCodeGeneratorProps) => {
  const { toast } = useToast();
  const [size, setSize] = useState(200);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copiado!', description: 'O link foi copiado para a área de transferência.' });
    } catch {
      toast({ title: 'Erro ao copiar', variant: 'destructive' });
    }
  };

  const handleDownloadPNG = () => {
    const canvas = document.getElementById('qrcode-canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qrcode-${companyName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'QR Code baixado!', description: 'Imagem PNG salva com sucesso.' });
    }
  };

  const handleDownloadSVG = () => {
    const svg = document.getElementById('qrcode-svg');
    if (svg) {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `qrcode-${companyName.replace(/\s+/g, '-').toLowerCase()}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      toast({ title: 'QR Code baixado!', description: 'Imagem SVG salva com sucesso.' });
    }
  };

  const handleOpenLink = () => {
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code de Agendamento
        </CardTitle>
        <CardDescription>
          Imprima e exiba este QR Code para seus clientes agendarem facilmente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Preview */}
        <div className="flex flex-col items-center gap-4">
          <div 
            className="p-4 rounded-lg border-2 border-dashed border-muted"
            style={{ backgroundColor: bgColor }}
          >
            <QRCodeSVG
              id="qrcode-svg"
              value={url}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              includeMargin
            />
            {/* Hidden canvas for PNG download */}
            <div className="hidden">
              <QRCodeCanvas
                id="qrcode-canvas"
                value={url}
                size={size * 2}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Escaneie para acessar a página de agendamento de <strong>{companyName}</strong>
          </p>
        </div>

        {/* Customization */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Tamanho</Label>
            <Input
              id="size"
              type="number"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              min={100}
              max={400}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fgColor">Cor do QR</Label>
            <div className="flex gap-2">
              <Input
                id="fgColor"
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bgColor">Cor de Fundo</Label>
            <div className="flex gap-2">
              <Input
                id="bgColor"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleDownloadPNG} variant="default">
            <Download className="h-4 w-4 mr-2" />
            Baixar PNG
          </Button>
          <Button onClick={handleDownloadSVG} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar SVG
          </Button>
          <Button onClick={handleCopyLink} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
          <Button onClick={handleOpenLink} variant="ghost">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Link
          </Button>
        </div>

        {/* URL Display */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">URL de Agendamento:</p>
          <p className="text-sm font-mono break-all">{url}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
