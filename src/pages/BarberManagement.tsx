import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import Layout from '@/components/Layout';
import { Plus, Power, PowerOff } from 'lucide-react';
import { useBarbers } from '@/hooks/useBarbers';
import { Barber } from '@/types/appointments';

interface BarberFormData {
  full_name: string;
  email: string;
  phone: string;
  specializations: string; // comma separated string
  active: boolean;
}

const BarberManagement = () => {
  const { barbers, isLoading, addBarber, updateBarber, toggleBarberStatus } = useBarbers();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<BarberFormData>({
    full_name: "",
    email: "",
    phone: "",
    specializations: "",
    active: true,
  });

  useEffect(() => {
    if (editingBarber) {
      setFormData({
        full_name: editingBarber.full_name,
        email: editingBarber.email || "",
        phone: editingBarber.phone || "",
        specializations: editingBarber.specialties?.join(', ') || "",
        active: editingBarber.active || true,
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        specializations: "",
        active: true,
      });
    }
  }, [editingBarber, dialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email) {
      // Validation handled by hook/toast internally
      return;
    }

    setSubmitting(true);

    try {
      if (editingBarber) {
        await updateBarber({ id: editingBarber.id, formData });
      } else {
        await addBarber(formData);
      }

      setDialogOpen(false);
      setEditingBarber(null);
    } catch (error) {
      // Error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setDialogOpen(true);
  };

  const handleToggleStatus = async (barber: Barber) => {
    await toggleBarberStatus({ id: barber.id, currentStatus: barber.active || false });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Carregando barbeiros...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Barbeiros</h1>
            <p className="text-muted-foreground">
              Gerencie os profissionais da barbearia
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Barbeiro
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <Card key={barber.id} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{barber.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{barber.email}</p>
                  </div>
                  <Badge variant={barber.active ? "default" : "secondary"}>
                    {barber.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Telefone:</span> {barber.phone || 'Não informado'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Especializações:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {barber.specialties?.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      )) || <span className="text-muted-foreground">Nenhuma</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(barber)}>
                    Editar
                  </Button>
                  <Button 
                    variant={barber.active ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleToggleStatus(barber)}
                  >
                    {barber.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingBarber(null);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBarber ? "Editar Barbeiro" : "Novo Barbeiro"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
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
                <Label htmlFor="specializations">Especializações (separadas por vírgula)</Label>
                <Input
                  id="specializations"
                  value={formData.specializations}
                  onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                  placeholder="Corte Masculino, Barba, Coloração"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Barbeiro ativo</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Salvando..." : (editingBarber ? "Atualizar" : "Cadastrar")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default BarberManagement;