import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generatePixCode, generateTxId, formatCurrency, PixPaymentData } from '@/lib/pixUtils';

interface PixPaymentProps {
  amount: number;
  pixKey: string;
  pixKeyType: PixPaymentData['pixKeyType'];
  merchantName: string;
  merchantCity: string;
  description?: string;
  expirationMinutes?: number;
  onPaymentConfirmed?: () => void;
  onCancel?: () => void;
}

const PixPayment: React.FC<PixPaymentProps> = ({
  amount,
  pixKey,
  pixKeyType,
  merchantName,
  merchantCity,
  description,
  expirationMinutes = 30,
  onPaymentConfirmed,
  onCancel
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(expirationMinutes * 60);

  // Generate PIX code
  const { pixCode, txid } = useMemo(() => {
    const txid = generateTxId('NR');
    const pixCode = generatePixCode({
      pixKey,
      pixKeyType,
      merchantName,
      merchantCity,
      amount,
      txid,
      description
    });
    return { pixCode, txid };
  }, [pixKey, pixKeyType, merchantName, merchantCity, amount, description]);

  // Countdown timer
  React.useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({ title: 'Código PIX copiado!' });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({ 
        title: 'Erro ao copiar', 
        description: 'Não foi possível copiar o código',
        variant: 'destructive' 
      });
    }
  };

  const isExpired = timeRemaining <= 0;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2">
          <img 
            src="https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Logomarcas/Logo-Pix-Estatica.svg" 
            alt="PIX" 
            className="h-8"
          />
          Pagamento PIX
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Valor a pagar</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(amount)}</p>
        </div>

        {/* Expiration Timer */}
        <div className={`flex items-center justify-center gap-2 p-2 rounded-lg ${
          isExpired ? 'bg-destructive/10 text-destructive' : 'bg-muted'
        }`}>
          {isExpired ? (
            <>
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Código expirado</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              <span className="text-sm">Expira em: <strong>{formatTime(timeRemaining)}</strong></span>
            </>
          )}
        </div>

        {/* QR Code */}
        {!isExpired && (
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG 
              value={pixCode} 
              size={200}
              level="M"
              includeMargin
            />
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Como pagar:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abra o app do seu banco</li>
            <li>Escolha pagar com PIX</li>
            <li>Escaneie o QR Code ou copie o código</li>
            <li>Confirme o pagamento</li>
          </ol>
        </div>

        {/* Copy Code Button */}
        {!isExpired && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Código copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar código PIX
              </>
            )}
          </Button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onCancel && (
            <Button variant="ghost" className="flex-1" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          {onPaymentConfirmed && !isExpired && (
            <Button className="flex-1" onClick={onPaymentConfirmed}>
              Já paguei
            </Button>
          )}
        </div>

        {/* Transaction ID */}
        <p className="text-xs text-center text-muted-foreground">
          ID da transação: {txid}
        </p>
      </CardContent>
    </Card>
  );
};

export default PixPayment;
