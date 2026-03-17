import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, Plus, Edit, Trash2, Calendar, Users } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import Layout from "@/components/Layout";
import { Client } from "@/types/appointments";
import { formatPhoneBR, formatNameOnly } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatusCards } from "@/components/ui/status-cards";
import { SearchFilters } from "@/components/ui/search-filters";

interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const Clients = () => {
  const { clients, isLoading, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({ name: "", phone: "", email: "", notes: "" });

  useEffect(() => {
    if (editingClient) {
      setFormData({ name: editingClient.name, phone: editingClient.phone, email: editingClient.email || "", notes: editingClient.notes || "" });
    } else {
      setFormData({ name: "", phone: "", email: "", notes: "" });
    }
  }, [editingClient, isDialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!formData.name || !formData.phone) { setSubmitting(false); return; }
    try {
      if (editingClient) await updateClient({ id: editingClient.id, formData });
      else await addClient(formData);
      setIsDialogOpen(false);
      setEditingClient(null);
    } catch {} finally { setSubmitting(false); }
  };

  const handleEdit = (client: Client) => { setEditingClient(client); setIsDialogOpen(true); };
  const handleDelete = async (clientId: string) => { if (!confirm("Tem certeza que deseja excluir este cliente?")) return; await deleteClient(clientId); };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "";

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <PageHeader icon={<Users className="h-5 w-5" />} title="Clientes" subtitle="Gerencie sua base de clientes">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingClient(null)}><Plus className="h-4 w-4 mr-2" />Novo Cliente</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label htmlFor="name">Nome *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: formatNameOnly(e.target.value) })} placeholder="Nome completo" required /></div>
                <div><Label htmlFor="phone">Telefone *</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhoneBR(e.target.value) })} placeholder="(00)0000-0000" inputMode="tel" maxLength={14} required /></div>
                <div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="cliente@email.com" /></div>
                <div><Label htmlFor="notes">Observações</Label><Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Preferências, alergias, etc." rows={3} /></div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? "Salvando..." : (editingClient ? "Atualizar" : "Cadastrar")}</Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <StatusCards
          className="grid-cols-1 sm:grid-cols-3"
          items={[
            { label: "Total de Clientes", value: clients.length, icon: <User className="h-5 w-5" />, color: "blue" },
            { label: "Com E-mail", value: clients.filter(c => c.email).length, icon: <Mail className="h-5 w-5" />, color: "green" },
            { label: "Com Telefone", value: clients.filter(c => c.phone).length, icon: <Phone className="h-5 w-5" />, color: "purple" },
          ]}
        />

        <SearchFilters
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nome, telefone ou e-mail..."
          resultCount={filteredClients.length}
          resultLabel="cliente(s)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">Carregando...</div>
          ) : filteredClients.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-30" />
              <p>Nenhum cliente encontrado.</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div key={client.id} className="rounded-xl border border-border/40 bg-card p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base truncate">{client.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{client.phone}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(client)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(client.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                {client.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.notes && <Badge variant="secondary" className="text-xs mb-2">Com observações</Badge>}
                <div className="text-xs text-muted-foreground pt-3 border-t border-border/40 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Cliente desde {formatDate(client.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Clients;
