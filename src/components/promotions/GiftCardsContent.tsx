import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Plus, Search, CreditCard, DollarSign, QrCode, Copy, Check } from 'lucide-react';
import { useGiftCards, GiftCard, CreateGiftCardInput } from '@/hooks/useGiftCards';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';

const GiftCardForm = ({ onSubmit, onClose }: { onSubmit: (data: CreateGiftCardInput) => void; onClose: () => void }) => {
  const [formData, setFormData] = useState<CreateGiftCardInput>({ original_value: 50, buyer_name: '', buyer_email: '', recipient_name: '', recipient_email: '', message: '', expires_at: '' });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); onClose(); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="text-sm font-medium">Valor (R$) *</label><Input type="number" min="10" step="10" value={formData.original_value} onChange={(e) => setFormData({ ...formData, original_value: Number(e.target.value) })} required /></div>
      <div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium">Comprador</label><Input value={formData.buyer_name} onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })} /></div><div><label className="text-sm font-medium">Email Comprador</label><Input type="email" value={formData.buyer_email} onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })} /></div></div>
      <div className="grid grid-cols-2 gap-4"><div><label className="text-sm font-medium">Presenteado</label><Input value={formData.recipient_name} onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })} /></div><div><label className="text-sm font-medium">Email Presenteado</label><Input type="email" value={formData.recipient_email} onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })} /></div></div>
      <div><label className="text-sm font-medium">Mensagem</label><Input value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} /></div>
      <div><label className="text-sm font-medium">Validade</label><Input type="date" value={formData.expires_at} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })} min={new Date().toISOString().split('T')[0]} /></div>
      <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit">Criar Gift Card</Button></div>
    </form>
  );
};

const RedeemDialog = ({ onRedeem }: { onRedeem: (code: string, amount: number) => void }) => {
  const [code, setCode] = useState(''); const [amount, setAmount] = useState(''); const { validateGiftCard } = useGiftCards();
  const [validation, setValidation] = useState<{ valid: boolean; giftCard?: GiftCard; error?: string } | null>(null); const [isOpen, setIsOpen] = useState(false);
  const handleValidate = async () => { if (!code) return; setValidation(await validateGiftCard(code)); };
  const handleRedeem = () => { if (validation?.valid && amount) { onRedeem(code, Number(amount)); setIsOpen(false); setCode(''); setAmount(''); setValidation(null); } };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button variant="outline"><QrCode className="h-4 w-4 mr-2" />Resgatar</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Resgatar Gift Card</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Código</label><div className="flex gap-2"><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="GC-XXXX" /><Button type="button" onClick={handleValidate}>Validar</Button></div></div>
          {validation && <div className={`p-4 rounded-lg ${validation.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>{validation.valid && validation.giftCard ? <div><p className="text-green-800 font-medium">✓ Válido!</p><p className="text-sm">Saldo: R$ {Number(validation.giftCard.current_balance).toFixed(2)}</p></div> : <p className="text-red-800">{validation.error}</p>}</div>}
          {validation?.valid && <div><label className="text-sm font-medium">Valor (R$)</label><Input type="number" min="0.01" max={validation.giftCard?.current_balance} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button onClick={handleRedeem} disabled={!validation?.valid || !amount}>Confirmar</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const GiftCardCard = ({ giftCard }: { giftCard: GiftCard }) => {
  const { toast } = useToast(); const [copied, setCopied] = useState(false);
  const statusColors: Record<string, string> = { active: 'bg-green-100 text-green-800', used: 'bg-gray-100 text-gray-800', expired: 'bg-red-100 text-red-800', cancelled: 'bg-orange-100 text-orange-800' };
  const statusLabels: Record<string, string> = { active: 'Ativo', used: 'Utilizado', expired: 'Expirado', cancelled: 'Cancelado' };
  const copyCode = () => { navigator.clipboard.writeText(giftCard.code); setCopied(true); toast({ title: 'Código copiado!' }); setTimeout(() => setCopied(false), 2000); };
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
        <div className="flex items-center justify-between"><Gift className="h-8 w-8" /><Badge className={statusColors[giftCard.status]}>{statusLabels[giftCard.status]}</Badge></div>
        <p className="text-2xl font-bold mt-2">R$ {Number(giftCard.current_balance).toFixed(2)}</p>
        {Number(giftCard.current_balance) !== Number(giftCard.original_value) && <p className="text-sm opacity-80">de R$ {Number(giftCard.original_value).toFixed(2)}</p>}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between"><code className="bg-muted px-3 py-1 rounded font-mono text-sm">{giftCard.code}</code><Button variant="ghost" size="sm" onClick={copyCode}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div>
        <Dialog><DialogTrigger asChild><Button variant="outline" size="sm" className="w-full"><QrCode className="h-4 w-4 mr-2" />Ver QR Code</Button></DialogTrigger><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>QR Code - {giftCard.code}</DialogTitle></DialogHeader><div className="flex flex-col items-center gap-4 p-4"><QRCodeSVG value={giftCard.code} size={200} /><p className="text-2xl font-bold">R$ {Number(giftCard.current_balance).toFixed(2)}</p></div></DialogContent></Dialog>
        <div className="text-sm text-muted-foreground space-y-1">{giftCard.recipient_name && <p>Para: {giftCard.recipient_name}</p>}{giftCard.buyer_name && <p>De: {giftCard.buyer_name}</p>}{giftCard.expires_at && <p>Validade: {format(new Date(giftCard.expires_at), 'dd/MM/yyyy', { locale: ptBR })}</p>}</div>
        {giftCard.message && <div className="bg-muted p-3 rounded-lg text-sm italic">"{giftCard.message}"</div>}
      </CardContent>
    </Card>
  );
};

const GiftCardsContent = () => {
  const { giftCards, isLoading, createGiftCard, redeemGiftCard, stats } = useGiftCards();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCards = giftCards.filter(gc => {
    const matchesSearch = gc.code.toLowerCase().includes(searchTerm.toLowerCase()) || gc.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || gc.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === 'all' || gc.status === statusFilter);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <RedeemDialog onRedeem={(code, amount) => redeemGiftCard.mutate({ code, amount })} />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Gift Card</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Criar Novo Gift Card</DialogTitle></DialogHeader><GiftCardForm onSubmit={(data) => createGiftCard.mutate(data)} onClose={() => setIsDialogOpen(false)} /></DialogContent></Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="p-3 bg-green-100 rounded-full"><CreditCard className="h-6 w-6 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Ativos</p><p className="text-2xl font-bold">{stats.totalActive}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-full"><DollarSign className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Saldo</p><p className="text-2xl font-bold">R$ {stats.totalValue.toFixed(2)}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="p-3 bg-purple-100 rounded-full"><Gift className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm text-muted-foreground">Utilizados</p><p className="text-2xl font-bold">{stats.totalRedeemed}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="p-3 bg-orange-100 rounded-full"><DollarSign className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm text-muted-foreground">Receita</p><p className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</p></div></div></CardContent></Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}><TabsList><TabsTrigger value="all">Todos</TabsTrigger><TabsTrigger value="active">Ativos</TabsTrigger><TabsTrigger value="used">Utilizados</TabsTrigger></TabsList></Tabs>
      </div>

      {isLoading ? <div className="text-center py-12"><p className="text-muted-foreground">Carregando...</p></div> : filteredCards.length === 0 ? <Card className="p-12 text-center"><Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Nenhum gift card encontrado</p></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filteredCards.map(gc => <GiftCardCard key={gc.id} giftCard={gc} />)}</div>
      )}
    </div>
  );
};

export default GiftCardsContent;
