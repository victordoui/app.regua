import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  UserCheck, 
  UserX,
  Users as UsersIcon,
  Scissors,
  Crown,
  Shield
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import Layout from "@/components/Layout";
import { PageContainer, PageHeader } from "@/components/ui/page-header";

interface UserProfile {
  id: string;
  user_id: string;
  auth_user_id: string | null;
  display_name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
}

const Users = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [teamForm, setTeamForm] = useState({ display_name: "", email: "", role: "barbeiro" as const });

  const fetchAllProfiles = useCallback(async (): Promise<UserProfile[]> => {
    if (!currentUser) return [];
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, auth_user_id, display_name, email, role, active, created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return (data || []).map(p => ({
      ...p,
      display_name: p.display_name || p.email || 'Usuário Desconhecido',
      active: p.active ?? true,
    })) as UserProfile[];
  }, [currentUser]);

  const { data: profiles = [], isLoading } = useQuery<UserProfile[], Error>({
    queryKey: ["allProfiles", currentUser?.id],
    queryFn: fetchAllProfiles,
    enabled: !!currentUser,
  });

  const openCreateDialog = () => {
    setEditingProfile(null);
    setTeamForm({ display_name: "", email: "", role: "barbeiro" });
    setDialogOpen(true);
  };

  const openEditDialog = (profile: UserProfile) => {
    setEditingProfile(profile);
    setTeamForm({
      display_name: profile.display_name,
      email: profile.email || "",
      role: "barbeiro",
    });
    setDialogOpen(true);
  };

  const openInviteDialog = (profile: UserProfile) => {
    setEditingProfile(null);
    setTeamForm({
      display_name: profile.display_name,
      email: profile.email || "",
      role: "barbeiro",
    });
    setDialogOpen(true);
  };

  const saveTeamMemberMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-team-access", {
        body: editingProfile
          ? { action: "update", profile_id: editingProfile.id, display_name: teamForm.display_name, role: teamForm.role }
          : { action: "invite", ...teamForm },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProfiles"] });
      setDialogOpen(false);
      toast({
        title: editingProfile ? "Acesso atualizado" : "Convite enviado",
        description: editingProfile
          ? "As permissões da equipe foram atualizadas."
          : "O profissional receberá um e-mail para definir o acesso.",
      });
    },
    onError: (error: Error) => {
      const messages: Record<string, string> = {
        EMAIL_ALREADY_REGISTERED: "Este e-mail já possui uma conta. Use outro endereço ou recupere o acesso existente.",
        EMAIL_ALREADY_IN_TEAM: "Este e-mail já faz parte da equipe.",
        INVITE_FAILED: "Não foi possível enviar o convite. Verifique a configuração de e-mail do sistema.",
      };
      toast({ title: "Não foi possível salvar o acesso", description: messages[error.message] || error.message, variant: "destructive" });
    },
  });

  // Toggle user active status and its corresponding login role together.
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: boolean }) => {
      const { data, error } = await supabase.functions.invoke("manage-team-access", {
        body: { action: "set_active", profile_id: id, active: !currentStatus },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["allProfiles"] });
      toast({ 
        title: variables.currentStatus ? "Usuário desativado" : "Usuário ativado",
        description: "Status atualizado com sucesso."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, currentStatus });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-[hsl(var(--rose-bg))] text-[hsl(var(--rose))]";
      case "barbeiro": return "bg-[hsl(var(--primary-50))] text-primary";
      case "recepcionista": return "bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]";
      case "cliente": return "bg-secondary text-foreground";
      default: return "bg-secondary text-foreground";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "barbeiro": return "Profissional";
      case "recepcionista": return "Recepcionista";
      case "cliente": return "Cliente";
      default: return role;
    }
  };

  const getStatusColor = (active: boolean) => {
    return active 
      ? "bg-[hsl(var(--success-bg))] text-[hsl(var(--success))]" 
      : "bg-[hsl(var(--rose-bg))] text-[hsl(var(--rose))]";
  };

  const getStatusLabel = (active: boolean) => {
    return active ? "Ativo" : "Inativo";
  };

  const getStatColor = (color: string) => {
    switch (color) {
      case "blue": return "from-primary to-primary-800";
      case "green": return "from-primary-400 to-primary-600";
      case "orange": return "from-primary-600 to-primary-800";
      case "purple": return "from-primary to-primary-800";
      default: return "from-primary to-primary-800";
    }
  };

  const filteredUsers = profiles.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      title: "Total de Perfis",
      value: profiles.length.toString(),
      subtitle: "Cadastrados no sistema",
      icon: UsersIcon,
      color: "blue"
    },
    {
      title: "Profissionais Ativos",
      value: profiles.filter(u => u.role === 'barbeiro' && u.active).length.toString(),
      subtitle: "Profissionais disponíveis",
      icon: Scissors,
      color: "green"
    },
    {
      title: "Administradores",
      value: profiles.filter(u => u.role === 'admin').length.toString(), 
      subtitle: "Com acesso total",
      icon: Shield,
      color: "orange"
    },
    {
      title: "Acessos Ativos",
      value: profiles.filter(u => u.auth_user_id && u.active).length.toString(),
      subtitle: "Contas aptas a entrar",
      icon: Crown,
      color: "purple"
    }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Carregando usuários...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        {/* Header */}
        <PageHeader eyebrow="Meu negócio" icon={<UsersIcon className="h-5 w-5" />} title="Usuários" subtitle="Gerencie acessos, papéis e disponibilidade da equipe">
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </PageHeader>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProfile ? "Editar acesso" : "Convidar para a equipe"}</DialogTitle>
              <DialogDescription>
                {editingProfile
                  ? "Atualize o nome e o nível de acesso desta pessoa."
                  : "A pessoa receberá um e-mail para criar a senha e acessar o VIZZU."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="team-name">Nome</Label>
                <Input id="team-name" value={teamForm.display_name} onChange={(event) => setTeamForm(current => ({ ...current, display_name: event.target.value }))} placeholder="Nome da pessoa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-email">E-mail</Label>
                <Input id="team-email" type="email" value={teamForm.email} disabled={Boolean(editingProfile)} onChange={(event) => setTeamForm(current => ({ ...current, email: event.target.value }))} placeholder="pessoa@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label>Nível de acesso</Label>
                <Select value={teamForm.role} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barbeiro">Profissional — agenda, clientes e conversas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button
                onClick={() => saveTeamMemberMutation.mutate()}
                disabled={saveTeamMemberMutation.isPending || teamForm.display_name.trim().length < 2 || (!editingProfile && !teamForm.email.includes("@"))}
              >
                {saveTeamMemberMutation.isPending ? "Salvando..." : editingProfile ? "Salvar alterações" : "Enviar convite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.subtitle}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${getStatColor(stat.color)}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex flex-col gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-muted-foreground font-medium">
                          {getInitials(user.display_name)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.display_name}</span>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                          <Badge className={getStatusColor(user.active)}>
                            {getStatusLabel(user.active)}
                          </Badge>
                          {!user.auth_user_id && <Badge variant="outline">Sem acesso</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.auth_user_id ? <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem> : <DropdownMenuItem onClick={() => openInviteDialog(user)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Enviar convite de acesso
                        </DropdownMenuItem>}
                        {user.auth_user_id && <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.active)}>
                          {user.active ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </Layout>
  );
};

export default Users;
