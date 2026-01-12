import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Megaphone, 
  Plus, 
  Send, 
  Clock, 
  FileEdit, 
  Trash2, 
  Copy, 
  Mail, 
  Users, 
  CalendarIcon,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useEmailCampaigns, TARGET_SEGMENTS, EmailCampaign } from '@/hooks/useEmailCampaigns';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const Campaigns = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    target_segment: 'all' as keyof typeof TARGET_SEGMENTS,
    scheduled_at: undefined as Date | undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { 
    campaigns, 
    isLoading, 
    createCampaign, 
    updateCampaign, 
    deleteCampaign,
    isCreating,
    isUpdating,
    isDeleting,
    getCampaignsByStatus
  } = useEmailCampaigns();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Enviada</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Agendada</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="secondary">Rascunho</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleOpenDialog = (campaign?: EmailCampaign) => {
    if (campaign) {
      setIsEditing(true);
      setEditingId(campaign.id);
      setFormData({
        subject: campaign.subject,
        content: campaign.content,
        target_segment: campaign.target_segment as keyof typeof TARGET_SEGMENTS,
        scheduled_at: campaign.scheduled_at ? new Date(campaign.scheduled_at) : undefined
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        subject: '',
        content: '',
        target_segment: 'all',
        scheduled_at: undefined
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveCampaign = async (asDraft = true) => {
    try {
      const status = asDraft ? 'draft' : (formData.scheduled_at ? 'scheduled' : 'draft');
      
      if (isEditing && editingId) {
        await updateCampaign({
          id: editingId,
          subject: formData.subject,
          content: formData.content,
          target_segment: formData.target_segment,
          scheduled_at: formData.scheduled_at?.toISOString() || null,
          status
        });
      } else {
        await createCampaign({
          subject: formData.subject,
          content: formData.content,
          target_segment: formData.target_segment,
          scheduled_at: formData.scheduled_at?.toISOString(),
          status
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const handleDuplicate = async (campaign: EmailCampaign) => {
    await createCampaign({
      subject: `${campaign.subject} (Cópia)`,
      content: campaign.content,
      target_segment: campaign.target_segment as 'all' | 'inactive' | 'birthday' | 'new',
      status: 'draft'
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
      await deleteCampaign(id);
    }
  };

  const handlePreview = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setIsPreviewOpen(true);
  };

  const filteredCampaigns = activeTab === 'all' 
    ? campaigns 
    : getCampaignsByStatus(activeTab);

  const stats = {
    total: campaigns.length,
    draft: getCampaignsByStatus('draft').length,
    scheduled: getCampaignsByStatus('scheduled').length,
    sent: getCampaignsByStatus('sent').length
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campanhas / Marketing</h1>
            <p className="text-muted-foreground">
              Crie e gerencie campanhas de email para seus clientes.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-secondary">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-sm text-muted-foreground">Agendadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sent}</p>
                <p className="text-sm text-muted-foreground">Enviadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="draft">Rascunhos</TabsTrigger>
                <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
                <TabsTrigger value="sent">Enviadas</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma campanha encontrada.</p>
                <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Agendamento</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(campaign.status)}
                          {getStatusBadge(campaign.status)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {campaign.subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {TARGET_SEGMENTS[campaign.target_segment as keyof typeof TARGET_SEGMENTS]?.label || campaign.target_segment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {campaign.scheduled_at 
                          ? format(new Date(campaign.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {format(new Date(campaign.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handlePreview(campaign)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(campaign)}>
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDuplicate(campaign)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(campaign.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Campaign Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Campanha' : 'Nova Campanha'}</DialogTitle>
              <DialogDescription>
                Configure os detalhes da sua campanha de email.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto do Email</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Promoção especial para você!"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment">Segmento de Clientes</Label>
                <Select
                  value={formData.target_segment}
                  onValueChange={(value) => setFormData({ ...formData, target_segment: value as keyof typeof TARGET_SEGMENTS })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TARGET_SEGMENTS).map(([key, segment]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{segment.label}</span>
                          <span className="text-xs text-muted-foreground">{segment.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo do Email</Label>
                <Textarea
                  id="content"
                  placeholder="Digite o conteúdo do seu email aqui..."
                  className="min-h-[200px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Agendar Envio (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduled_at && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduled_at 
                        ? format(formData.scheduled_at, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : "Selecione uma data"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_at}
                      onSelect={(date) => setFormData({ ...formData, scheduled_at: date })}
                      locale={ptBR}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {formData.scheduled_at && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFormData({ ...formData, scheduled_at: undefined })}
                  >
                    Limpar data
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleSaveCampaign(true)}
                disabled={isCreating || isUpdating || !formData.subject}
              >
                {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Rascunho
              </Button>
              {formData.scheduled_at && (
                <Button 
                  onClick={() => handleSaveCampaign(false)}
                  disabled={isCreating || isUpdating || !formData.subject || !formData.content}
                >
                  {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Clock className="h-4 w-4 mr-2" />
                  Agendar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview da Campanha</DialogTitle>
            </DialogHeader>

            {selectedCampaign && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">{selectedCampaign.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        Para: {TARGET_SEGMENTS[selectedCampaign.target_segment as keyof typeof TARGET_SEGMENTS]?.label}
                      </p>
                    </div>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {selectedCampaign.content}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Status: {getStatusBadge(selectedCampaign.status)}</span>
                  {selectedCampaign.scheduled_at && (
                    <span>
                      Agendada para: {format(new Date(selectedCampaign.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Campaigns;
