import { useState } from 'react';
import { SuperAdminLayout } from '@/components/superadmin/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePlatformTemplates } from '@/hooks/superadmin/usePlatformTemplates';
import { Mail, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { EmailTemplateFormData } from '@/types/superAdmin';

const triggerLabels: Record<string, string> = {
  welcome: 'Boas-vindas',
  renewal_reminder: 'Lembrete de Renovação',
  payment_failed: 'Falha no Pagamento',
  plan_upgrade: 'Upgrade de Plano',
  subscription_cancelled: 'Cancelamento',
};

const EmailTemplates = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmailTemplateFormData>({
    name: '',
    subject: '',
    body_html: '',
    trigger_event: null,
    active: true,
  });

  const {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateActive,
    isCreating,
    isUpdating,
  } = usePlatformTemplates();

  const handleSubmit = () => {
    if (editingTemplate) {
      updateTemplate({ id: editingTemplate, data: formData });
    } else {
      createTemplate(formData);
    }
    setIsDialogOpen(false);
    setEditingTemplate(null);
    resetForm();
  };

  const handleEdit = (template: any) => {
    setFormData({
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      trigger_event: template.trigger_event,
      active: template.active,
    });
    setEditingTemplate(template.id);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body_html: '',
      trigger_event: null,
      active: true,
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Templates de Email</h1>
            <p className="text-muted-foreground">
              Gerencie templates para comunicações automáticas
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Templates ({templates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Mail className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum template criado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Gatilho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        {template.trigger_event ? (
                          <Badge variant="outline">
                            {triggerLabels[template.trigger_event] || template.trigger_event}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={template.active}
                          onCheckedChange={(checked) =>
                            toggleTemplateActive({ id: template.id, active: checked })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(template.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setPreviewTemplate(template.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(template)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    placeholder="Nome do template"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gatilho</label>
                  <Select
                    value={formData.trigger_event || 'none'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, trigger_event: value === 'none' ? null : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum (manual)</SelectItem>
                      <SelectItem value="welcome">Boas-vindas</SelectItem>
                      <SelectItem value="renewal_reminder">Lembrete de Renovação</SelectItem>
                      <SelectItem value="payment_failed">Falha no Pagamento</SelectItem>
                      <SelectItem value="plan_upgrade">Upgrade de Plano</SelectItem>
                      <SelectItem value="subscription_cancelled">Cancelamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assunto</label>
                <Input
                  placeholder="Assunto do email"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Corpo (HTML)</label>
                <Textarea
                  placeholder="<html>..."
                  value={formData.body_html}
                  onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis disponíveis: {'{{name}}'}, {'{{email}}'}, {'{{plan}}'}, {'{{expiry_date}}'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <label className="text-sm">Template ativo</label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating || isUpdating || !formData.name || !formData.subject}
                >
                  {editingTemplate ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Preview do Template</DialogTitle>
            </DialogHeader>
            {previewTemplate && (
              <div className="border rounded-lg p-4">
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      templates.find((t) => t.id === previewTemplate)?.body_html ||
                      '<p>Sem conteúdo</p>',
                  }}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
};

export default EmailTemplates;
