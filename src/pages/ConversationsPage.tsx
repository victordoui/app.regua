import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Plus, Send, Search, Users, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
}

interface Conversation {
  id: string;
  title: string | null;
  last_message: string | null;
  last_message_at: string;
  participant: Profile;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: Profile;
}

const ConversationsPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Fetch participant details separately
      const conversationsWithParticipants = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: participant } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", conv.participant_id)
            .single();
          
          return {
            ...conv,
            participant: participant || { id: '', user_id: conv.participant_id, display_name: null, email: null }
          };
        })
      );

      setConversations(conversationsWithParticipants);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user?.id);

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender details separately
      const messagesWithSenders = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: sender } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", msg.sender_id)
            .single();
          
          return {
            ...msg,
            sender: sender || { id: '', user_id: msg.sender_id, display_name: null, email: null }
          };
        })
      );

      setMessages(messagesWithSenders);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createConversation = async () => {
    if (!selectedUser) {
      toast({
        title: "Selecione um usuário",
        description: "Escolha um usuário para iniciar a conversa",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user?.id || '',
          participant_id: selectedUser,
          title: `Conversa com ${users.find(u => u.user_id === selectedUser)?.display_name || 'Usuário'}`
        })
        .select("*")
        .single();

      if (error) throw error;

      // Fetch participant details
      const { data: participant } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.participant_id)
        .single();

      const conversationWithParticipant = {
        ...data,
        participant: participant || { id: '', user_id: data.participant_id, display_name: null, email: null }
      };

      setConversations(prev => [conversationWithParticipant, ...prev]);
      setSelectedConversation(conversationWithParticipant);
      setDialogOpen(false);
      setSelectedUser("");

      toast({
        title: "Conversa criada!",
        description: "Nova conversa iniciada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar conversa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user?.id || '',
          content: newMessage.trim()
        });

      if (error) throw error;

      // Update conversation's last message
      await supabase
        .from("conversations")
        .update({
          last_message: newMessage.trim(),
          last_message_at: new Date().toISOString()
        })
        .eq("id", selectedConversation.id);

      setNewMessage("");
      fetchMessages(selectedConversation.id);
      fetchConversations();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.participant?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return `${days} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Carregando conversas...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 h-[calc(100vh-4rem)] p-6">
        <div className="flex h-full gap-6">
          {/* Sidebar - Lista de Conversas */}
          <div className="w-80 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Conversas</h1>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Conversa</DialogTitle>
                    <DialogDescription>
                      Selecione um usuário para iniciar uma nova conversa.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {user.display_name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              {user.display_name || user.email || 'Usuário'}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createConversation}>
                      Criar Conversa
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de Conversas */}
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedConversation?.id === conversation.id ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {conversation.participant?.display_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-sm truncate">
                              {conversation.participant?.display_name || 'Usuário'}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message || 'Nenhuma mensagem ainda'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredConversations.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">
                      {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery 
                        ? 'Tente ajustar sua busca.' 
                        : 'Inicie sua primeira conversa.'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setDialogOpen(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Conversa
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Área de Chat */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header do Chat */}
                <div className="border-b p-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedConversation.participant?.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium">
                      {selectedConversation.participant?.display_name || 'Usuário'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.participant?.email}
                    </p>
                  </div>
                </div>

                {/* Mensagens */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">Nenhuma mensagem ainda</h3>
                        <p className="text-sm text-muted-foreground">
                          Seja o primeiro a enviar uma mensagem!
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input de Nova Mensagem */}
                <div className="border-t p-4">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-medium mb-2">Selecione uma conversa</h2>
                  <p className="text-muted-foreground mb-4">
                    Escolha uma conversa da lista para começar a trocar mensagens.
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conversa
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConversationsPage;