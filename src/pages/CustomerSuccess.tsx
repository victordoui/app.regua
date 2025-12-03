import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Star, TrendingUp, Users, MessageSquare, Target, Send, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useClients } from '@/hooks/useClients'; // Importando hook real de clientes

interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  created_at?: string;
  last_visit?: string;
  total_visits: number;
  subscription_type?: string;
}

interface Feedback {
  id: string;
  client_id: string;
  client_name: string;
  rating: number;
  comment: string;
  service_type: string;
  barber_name: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'responded';
}

interface SatisfactionMetrics {
  overall_rating: number;
  total_feedbacks: number;
  response_rate: number;
  nps_score: number;
  retention_rate: number;
}

// Dados mockados para Feedbacks e Métricas (mantidos por enquanto)
const mockFeedbacks: Feedback[] = [
  {
    id: '1',
    client_id: '1',
    client_name: 'João Silva',
    rating: 5,
    comment: 'Excelente atendimento! O barbeiro foi muito profissional e o resultado ficou perfeito.',
    service_type: 'Corte + Barba',
    barber_name: 'Carlos',
    created_at: '2024-12-20',
    status: 'reviewed'
  },
  {
    id: '2',
    client_id: '2',
    client_name: 'Maria Santos',
    rating: 4,
    comment: 'Muito bom, mas a espera foi um pouco longa.',
    service_type: 'Corte Feminino',
    barber_name: 'Ana',
    created_at: '2024-12-18',
    status: 'pending'
  },
  {
    id: '3',
    client_id: '3',
    client_name: 'Pedro Costa',
    rating: 5,
    comment: 'Sempre saio satisfeito! Equipe nota 10.',
    service_type: 'Corte Masculino',
    barber_name: 'Roberto',
    created_at: '2024-12-15',
    status: 'responded'
  }
];

const initialMetrics: SatisfactionMetrics = {
  overall_rating: 4.7,
  total_feedbacks: 156,
  response_rate: 89,
  nps_score: 72,
  retention_rate: 85
};


function CustomerSuccess() {
  const { clients: realClients, isLoading: isLoadingClients } = useClients();
  
  // Mapeia clientes reais para o tipo Client local, adicionando dados mockados de visita/assinatura
  const clients: Client[] = realClients.map(c => ({
    ...c,
    name: c.name || c.email || 'Cliente',
    last_visit: '2024-12-20', // Mocked
    total_visits: 15, // Mocked
    subscription_type: c.id === '1' ? 'premium' : undefined, // Mocked
  }));

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks);
  const [metrics, setMetrics] = useState<SatisfactionMetrics>(initialMetrics);
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newFeedback, setNewFeedback] = useState({
    client_id: '',
    rating: 5,
    comment: '',
    service_type: '',
    barber_name: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmitFeedback = async () => {
    try {
      if (!newFeedback.client_id || !newFeedback.comment) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const clientName = clients.find(c => c.id === newFeedback.client_id)?.name || 'Cliente Desconhecido';

      // Em produção, salvaria no Supabase
      const feedback: Feedback = {
        id: Date.now().toString(),
        client_id: newFeedback.client_id,
        client_name: clientName,
        rating: newFeedback.rating,
        comment: newFeedback.comment,
        service_type: newFeedback.service_type,
        barber_name: newFeedback.barber_name,
        created_at: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      setFeedbacks(prev => [feedback, ...prev]);
      setNewFeedback({
        client_id: '',
        rating: 5,
        comment: '',
        service_type: '',
        barber_name: ''
      });
      setIsDialogOpen(false);
      toast.success('Feedback registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar feedback:', error);
      toast.error('Erro ao registrar feedback');
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, status: 'pending' | 'reviewed' | 'responded') => {
    try {
      setFeedbacks(prev => 
        prev.map(f => f.id === feedbackId ? { ...f, status } : f)
      );
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesFilter = feedbackFilter === 'all' || feedback.status === feedbackFilter;
    const matchesSearch = feedback.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'reviewed': return 'Analisado';
      case 'responded': return 'Respondido';
      default: return status;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoadingClients) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando dados de clientes...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sucesso do Cliente</h1>
            <p className="text-muted-foreground">
              Acompanhe a satisfação e feedback dos seus clientes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" />
                Novo Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Registrar Feedback</DialogTitle>
                <DialogDescription>
                  Adicione um novo feedback de cliente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Select value={newFeedback.client_id} onValueChange={(value) => 
                    setNewFeedback(prev => ({ ...prev, client_id: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">Avaliação</Label>
                  <Select value={newFeedback.rating.toString()} onValueChange={(value) => 
                    setNewFeedback(prev => ({ ...prev, rating: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center gap-2">
                            {renderStars(rating)}
                            <span>({rating})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="service">Tipo de Serviço</Label>
                  <Input
                    id="service"
                    value={newFeedback.service_type}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, service_type: e.target.value }))}
                    placeholder="Ex: Corte + Barba"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="barber">Barbeiro</Label>
                  <Input
                    id="barber"
                    value={newFeedback.barber_name}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, barber_name: e.target.value }))}
                    placeholder="Nome do barbeiro"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comment">Comentário</Label>
                  <Textarea
                    id="comment"
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Descreva a experiência do cliente..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmitFeedback}>
                  <Send className="w-4 h-4 mr-2" />
                  Salvar Feedback
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Métricas de Satisfação */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Geral</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.overall_rating}</div>
              <div className="flex items-center mt-1">
                {renderStars(Math.round(metrics.overall_rating))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Feedbacks</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_feedbacks}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.response_rate}%</div>
              <p className="text-xs text-muted-foreground">
                +5% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.nps_score}</div>
              <p className="text-xs text-muted-foreground">
                Excelente (70+)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retenção</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.retention_rate}%</div>
              <p className="text-xs text-muted-foreground">
                +3% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="feedbacks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="feedbacks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Feedbacks dos Clientes</CardTitle>
                    <CardDescription>
                      Gerencie e responda aos feedbacks recebidos
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar feedbacks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="reviewed">Analisados</SelectItem>
                        <SelectItem value="responded">Respondidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFeedbacks.map(feedback => (
                    <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{feedback.client_name}</h4>
                            <Badge className={getStatusColor(feedback.status)}>
                              {getStatusText(feedback.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{feedback.service_type}</span>
                            <span>•</span>
                            <span>Barbeiro: {feedback.barber_name}</span>
                            <span>•</span>
                            <span>{feedback.created_at}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(feedback.rating)}
                        </div>
                      </div>
                      <p className="text-sm">{feedback.comment}</p>
                      <div className="flex gap-2">
                        {feedback.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateFeedbackStatus(feedback.id, 'reviewed')}
                          >
                            Marcar como Analisado
                          </Button>
                        )}
                        {feedback.status === 'reviewed' && (
                          <Button
                            size="sm"
                            onClick={() => updateFeedbackStatus(feedback.id, 'responded')}
                          >
                            Marcar como Respondido
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Avaliações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-16">
                          {renderStars(rating)}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${rating === 5 ? 60 : rating === 4 ? 25 : rating === 3 ? 10 : rating === 2 ? 3 : 2}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {rating === 5 ? '60%' : rating === 4 ? '25%' : rating === 3 ? '10%' : rating === 2 ? '3%' : '2%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tendências Mensais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dezembro 2024</span>
                      <span className="font-semibold">4.7 ⭐</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Novembro 2024</span>
                      <span className="font-semibold">4.5 ⭐</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Outubro 2024</span>
                      <span className="font-semibold">4.6 ⭐</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Setembro 2024</span>
                      <span className="font-semibold">4.4 ⭐</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perfil dos Clientes</CardTitle>
                <CardDescription>
                  Acompanhe o histórico e satisfação de cada cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients.map(client => (
                    <div key={client.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{client.name}</h4>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Cliente desde: {client.created_at}</span>
                            <span>Última visita: {client.last_visit || 'N/A'}</span>
                            <span>Total de visitas: {client.total_visits}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {client.subscription_type && (
                            <Badge variant="secondary">
                              {client.subscription_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default CustomerSuccess;