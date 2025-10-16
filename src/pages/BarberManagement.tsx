import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Plus } from 'lucide-react';

interface Barber {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
  active: boolean;
  specializations?: string[];
}

const BarberManagement = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "barbeiro",
    active: true,
    specializations: ""
  });

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setBarbers([
        {
          id: '1',
          user_id: '1',
          full_name: 'Carlos Silva',
          email: 'carlos@email.com',
          phone: '(11) 99999-9999',
          role: 'barbeiro',
          active: true,
          specializations: ['Corte Masculino', 'Barba']
        },
        {
          id: '2',
          user_id: '2',
          full_name: 'João Santos',
          email: 'joao@email.com',
          phone: '(11) 88888-8888',
          role: 'barbeiro',
          active: true,
          specializations: ['Corte Feminino', 'Coloração']
        }
      ]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar barbeiros",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email) {
      toast({
        title: "Erro de validação",
        description: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingBarber) {
        // Update existing barber
        setBarbers(prev => 
          prev.map(b => b.id === editingBarber.id 
            ? { ...b, ...formData, specializations: formData.specializations.split(',').map(s => s.trim()) }
            : b
          )
        );
        toast({
          title: "Barbeiro atualizado!",
          description: "Os dados foram atualizados com sucesso.",
        });
      } else {
        // Create new barber
        const newBarber: Barber = {
          id: Date.now().toString(),
          user_id: Date.now().toString(),
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          active: formData.active,
          specializations: formData.specializations.split(',').map(s => s.trim())
        };
        setBarbers(prev => [...prev, newBarber]);
        toast({
          title: "Barbeiro cadastrado!",
          description: "O barbeiro foi adicionado com sucesso.",
        });
      }

      resetForm();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar barbeiro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setFormData({
      full_name: barber.full_name,
      email: barber.email,
      phone: barber.phone || "",
      role: barber.role || "barbeiro",
      active: barber.active,
      specializations: barber.specializations?.join(', ') || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBarber(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      role: "barbeiro",
      active: true,
      specializations: ""
    });
  };

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
                      {barber.specializations?.map((spec, index) => (
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
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setBarbers(prev => 
                        prev.map(b => b.id === barber.id ? { ...b, active: !b.active } : b)
                      );
                    }}
                  >
                    {barber.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <div className="flex gap-2">
                <Button type="submit">
                  {editingBarber ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default BarberManagement;