import { useState } from "react";
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

import Layout from "@/components/Layout";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string | null;
  lastLogin: string;
  createdAt: string;
}

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data de usuários
  const users: User[] = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@naregua.com",
      role: "admin",
      status: "active",
      avatar: null,
      lastLogin: "Há 2 horas",
      createdAt: "15/01/2025"
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@naregua.com", 
      role: "barbeiro",
      status: "active",
      avatar: null,
      lastLogin: "Há 1 dia",
      createdAt: "10/01/2025"
    },
    {
      id: "3",
      name: "Pedro Oliveira",
      email: "pedro@naregua.com",
      role: "barbeiro", 
      status: "inactive",
      avatar: null,
      lastLogin: "Há 1 semana",
      createdAt: "05/01/2025"
    },
    {
      id: "4",
      name: "Ana Costa",
      email: "ana@naregua.com",
      role: "recepcionista",
      status: "active", 
      avatar: null,
      lastLogin: "Há 3 horas",
      createdAt: "20/12/2024"
    }
  ];

  const stats = [
    {
      title: "Total de Usuários",
      value: users.length.toString(),
      subtitle: "Cadastrados no sistema",
      icon: UsersIcon,
      color: "blue"
    },
    {
      title: "Usuários Ativos",
      value: users.filter(u => u.status === 'active').length.toString(),
      subtitle: "Online nas últimas 24h",
      icon: UserCheck,
      color: "green"
    },
    {
      title: "Administradores",
      value: users.filter(u => u.role === 'admin').length.toString(), 
      subtitle: "Com acesso total",
      icon: Shield,
      color: "orange"
    },
    {
      title: "Barbeiros",
      value: users.filter(u => u.role === 'barbeiro').length.toString(),
      subtitle: "Profissionais ativos",
      icon: Crown,
      color: "purple"
    }
  ];

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
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "barbeiro": return "Barbeiro";
      case "recepcionista": return "Recepcionista";
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  const getStatusLabel = (status: string) => {
    return status === "active" ? "Ativo" : "Inativo";
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                        {getInitials(user.name)}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {getStatusLabel(user.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Último acesso: {user.lastLogin} • Criado em: {user.createdAt}
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
                        {user.status === "active" ? (
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