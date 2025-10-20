import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Trash2, 
  UserCheck, 
  UserX,
  Users as UsersIcon,
  Crown,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import Layout from "@/components/Layout";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  last_login?: string; // Mocked for now
}

const Users = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllProfiles = useCallback(async (): Promise<UserProfile[]> => {
    if (!currentUser) return [];
    
    // Fetch all profiles managed by the current user
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, email, role, active, created_at");

    if (error) throw error;
    
    return (data || []).map(p => ({
      ...p,
      display_name: p.display_name || p.email || 'Usuário Desconhecido',
      active: p.active ?? true, // Assuming active by default if not set
      last_login: "N/A" // Mocked as we don't track last login in profiles table
    })) as UserProfile[];
  }, [currentUser]);

  const { data: profiles = [], isLoading } = useQuery<UserProfile[], Error>({
    queryKey: ["allProfiles", currentUser?.id],
    queryFn: fetchAllProfiles,
    enabled: !!currentUser,
  });

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
      case "admin": return "bg-red-100 text-red-800";
      case "barbeiro": return "bg-blue-100 text-blue-800";
      case "recepcionista": return "bg-green-100 text-green-800";
      case "cliente": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "barbeiro": return "Barbeiro";
      case "recepcionista": return "Recepcionista";
      case "cliente": return "Cliente";
      default: return role;
    }
  };

  const getStatusColor = (active: boolean) => {
    return active 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  const getStatusLabel = (active: boolean) => {
    return active ? "Ativo" : "Inativo";
  };

  const getStatColor = (color: string) => {
    switch (color) {
      case "blue": return "from-blue-500 to-blue-600";
      case "green": return "from-green-500 to-green-600";
      case "orange": return "from-orange-500 to-orange-600";
      case "purple": return "from-purple-500 to-purple-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const filteredUsers = profiles.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      title: "Barbeiros Ativos",
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
      title: "Clientes",
      value: profiles.filter(u => u.role === 'cliente').length.toString(),
      subtitle: "Base de clientes",
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
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

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

        {/* Search and Filters */}
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
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
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
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Users;