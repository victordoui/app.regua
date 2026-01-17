import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package, Power, PowerOff, Upload, X, Loader2, ImageIcon, Percent, DollarSign, Clock } from 'lucide-react';
import { useServiceCombos, ServiceCombo, ServiceComboFormData, calculateComboPrice } from '@/hooks/useServiceCombos';
import { useServices } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CombosManager: React.FC = () => {
  const { combos, isLoading, createCombo, updateCombo, deleteCombo, toggleComboStatus } = useServiceCombos();
  const { services } = useServices();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ServiceCombo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ServiceComboFormData>({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    active: true,
    image_url: '',
    service_ids: []
  });

  useEffect(() => {
    if (editingCombo) {
      setFormData({
        name: editingCombo.name,
        description: editingCombo.description || '',
        discount_type: editingCombo.discount_type,
        discount_value: editingCombo.discount_value,
        active: editingCombo.active,
        image_url: editingCombo.image_url || '',
        service_ids: editingCombo.services?.map(s => s.id) || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        active: true,
        image_url: '',
        service_ids: []
      });
    }
  }, [editingCombo, dialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (formData.service_ids.length < 2) {
      toast.error('Selecione pelo menos 2 serviços para o combo');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCombo) {
        await updateCombo.mutateAsync({ id: editingCombo.id, formData });
      } else {
        await createCombo.mutateAsync(formData);
      }
      setDialogOpen(false);
      setEditingCombo(null);
    } catch (error) {
      // Error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (combo: ServiceCombo) => {
    setEditingCombo(combo);
    setDialogOpen(true);
  };

  const handleDelete = async (combo: ServiceCombo) => {
    if (!confirm(`Tem certeza que deseja excluir o combo "${combo.name}"?`)) return;
    await deleteCombo.mutateAsync(combo.id);
  };

  const handleToggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter(id => id !== serviceId)
        : [...prev.service_ids, serviceId]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `combo_${Date.now()}.${fileExt}`;
      const filePath = `combos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Imagem carregada!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  // Calculate preview price based on selected services
  const selectedServices = services.filter(s => formData.service_ids.includes(s.id));
  const pricePreview = selectedServices.length >= 2
    ? calculateComboPrice(
        selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price, duration_minutes: s.duration_minutes })),
        formData.discount_type,
        formData.discount_value
      )
    : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Combos de Serviços</h2>
          <p className="text-muted-foreground">Crie pacotes com desconto para seus clientes</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCombo(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Combo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCombo ? 'Editar Combo' : 'Novo Combo'}</DialogTitle>
                <DialogDescription>
                  {editingCombo ? 'Altere as informações do combo.' : 'Crie um pacote de serviços com desconto.'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Imagem */}
                <div className="space-y-2">
                  <Label>Imagem do Combo</Label>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    {formData.image_url ? (
                      <div className="relative">
                        <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          ref={fileInputRef}
                          disabled={uploadingImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando...</>
                          ) : (
                            <><Upload className="h-4 w-4 mr-2" /> Selecionar Imagem</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Combo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Corte + Barba"
                    required
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que está incluso no combo"
                    rows={2}
                  />
                </div>

                {/* Desconto */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Desconto</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, discount_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Porcentagem
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Valor Fixo
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_value">
                      {formData.discount_type === 'percentage' ? 'Desconto (%)' : 'Desconto (R$)'}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      min="0"
                      max={formData.discount_type === 'percentage' ? 100 : undefined}
                      step={formData.discount_type === 'percentage' ? 1 : 0.01}
                      value={formData.discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Serviços */}
                <div className="space-y-2">
                  <Label>Serviços do Combo * (mínimo 2)</Label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {services.filter(s => s.active).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={service.id}
                            checked={formData.service_ids.includes(service.id)}
                            onCheckedChange={() => handleToggleService(service.id)}
                          />
                          <label htmlFor={service.id} className="cursor-pointer">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({service.duration_minutes}min)
                            </span>
                          </label>
                        </div>
                        <span className="font-semibold text-primary">{formatCurrency(service.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview de Preço */}
                {pricePreview && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Prévia do Preço</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Preço Original:</span>
                      <span className="line-through">{formatCurrency(pricePreview.originalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Economia:</span>
                      <span className="text-green-600 font-medium">-{formatCurrency(pricePreview.savings)}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-lg mt-2 pt-2 border-t">
                      <span>Preço Final:</span>
                      <span className="text-primary">{formatCurrency(pricePreview.finalPrice)}</span>
                    </div>
                  </div>
                )}

                {/* Ativo */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Combo ativo</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : (editingCombo ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo) => {
          const pricing = combo.services && combo.services.length > 0
            ? calculateComboPrice(combo.services, combo.discount_type, combo.discount_value)
            : null;
          const totalDuration = combo.services?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

          return (
            <Card key={combo.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              {/* Imagem */}
              {combo.image_url ? (
                <div className="aspect-video overflow-hidden">
                  <img src={combo.image_url} alt={combo.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Package className="h-12 w-12 text-primary/50" />
                </div>
              )}

              {/* Badge de desconto */}
              <Badge className="absolute top-3 right-3 bg-green-500 text-white">
                {combo.discount_type === 'percentage' 
                  ? `-${combo.discount_value}%` 
                  : `-${formatCurrency(combo.discount_value)}`}
              </Badge>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{combo.name}</CardTitle>
                    <Badge variant={combo.active ? 'default' : 'secondary'} className="mt-1">
                      {combo.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {combo.description && (
                  <CardDescription className="text-sm line-clamp-2">
                    {combo.description}
                  </CardDescription>
                )}

                {/* Serviços inclusos */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Inclui:</p>
                  <div className="flex flex-wrap gap-1">
                    {combo.services?.map(s => (
                      <Badge key={s.id} variant="outline" className="text-xs">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Preço e duração */}
                {pricing && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {totalDuration}min
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(pricing.originalPrice)}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(pricing.finalPrice)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(combo)} className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={combo.active ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => toggleComboStatus.mutate({ id: combo.id, active: !combo.active })}
                  >
                    {combo.active ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(combo)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {combos.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum combo criado</h3>
          <p className="text-muted-foreground mb-4">
            Crie pacotes de serviços com desconto para atrair mais clientes!
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Combo
          </Button>
        </div>
      )}
    </div>
  );
};

export default CombosManager;
