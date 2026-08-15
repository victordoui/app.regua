import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageSquare, Plus, Search, Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Contact {
  authUserId: string;
  clientId: string;
  name: string;
  email: string | null;
}

interface Conversation {
  id: string;
  user_id: string;
  participant_id: string;
  title: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  contact: Contact;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const formatTime = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days === 0) return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Ontem";
  if (days < 7) return `${days} dias atrás`;
  return date.toLocaleDateString("pt-BR");
};

const ConversationsContent = () => {
  const { user } = useAuth();
  const { businessId } = useRole();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const loadContacts = useCallback(async (): Promise<Contact[]> => {
    if (!businessId) return [];
    const { data: links, error: linksError } = await supabase
      .from("client_profiles")
      .select("user_id, client_id")
      .eq("barbershop_user_id", businessId)
      .not("client_id", "is", null);
    if (linksError) throw linksError;

    const clientIds = [...new Set((links || []).map(link => link.client_id).filter(Boolean))] as string[];
    const { data: clients, error: clientsError } = clientIds.length
      ? await supabase.from("clients").select("id, name, email").in("id", clientIds)
      : { data: [], error: null };
    if (clientsError) throw clientsError;

    const clientsById = new Map((clients || []).map(client => [client.id, client]));
    return (links || []).flatMap(link => {
      if (!link.client_id) return [];
      const client = clientsById.get(link.client_id);
      if (!client) return [];
      return [{ authUserId: link.user_id, clientId: client.id, name: client.name, email: client.email }];
    });
  }, [businessId]);

  const refreshConversations = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const linkedContacts = await loadContacts();
      const contactsByAuth = new Map(linkedContacts.map(contact => [contact.authUserId, contact]));
      const { data, error } = await supabase
        .from("conversations")
        .select("id, user_id, participant_id, title, last_message, last_message_at, created_at")
        .eq("user_id", businessId)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;

      const visible = (data || []).flatMap(conversation => {
        const contact = contactsByAuth.get(conversation.participant_id);
        return contact ? [{ ...conversation, contact }] : [];
      });
      setContacts(linkedContacts);
      setConversations(visible);
      setSelectedConversation(current => current ? visible.find(item => item.id === current.id) || null : null);
    } catch (error) {
      toast({
        title: "Não foi possível carregar as conversas",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [businessId, loadContacts, toast]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    setMessages(data || []);
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    fetchMessages(selectedConversation.id).catch(error => {
      toast({ title: "Não foi possível abrir a conversa", description: error.message, variant: "destructive" });
    });
  }, [fetchMessages, selectedConversation, toast]);

  const availableContacts = useMemo(
    () => contacts.filter(contact => !conversations.some(item => item.participant_id === contact.authUserId)),
    [contacts, conversations],
  );

  const filteredConversations = conversations.filter(conversation =>
    conversation.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      || conversation.last_message?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const createConversation = async () => {
    if (!businessId || !selectedUser) return;
    const contact = contacts.find(item => item.authUserId === selectedUser);
    if (!contact) return;
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: businessId,
        participant_id: contact.authUserId,
        title: `Conversa com ${contact.name}`,
      })
      .select("id, user_id, participant_id, title, last_message, last_message_at, created_at")
      .single();
    if (error) {
      toast({ title: "Não foi possível iniciar a conversa", description: error.message, variant: "destructive" });
      return;
    }
    const conversation = { ...data, contact };
    setConversations(current => [conversation, ...current]);
    setSelectedConversation(conversation);
    setDialogOpen(false);
    setSelectedUser("");
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content || !selectedConversation || !user) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: selectedConversation.id, sender_id: user.id, content })
        .select("id, conversation_id, sender_id, content, created_at")
        .single();
      if (error) throw error;
      const sentAt = data.created_at;
      const { error: conversationError } = await supabase
        .from("conversations")
        .update({ last_message: content, last_message_at: sentAt })
        .eq("id", selectedConversation.id);
      if (conversationError) throw conversationError;
      setMessages(current => [...current, data]);
      setNewMessage("");
      setConversations(current => current.map(item => item.id === selectedConversation.id
        ? { ...item, last_message: content, last_message_at: sentAt }
        : item));
    } catch (error) {
      toast({
        title: "Mensagem não enviada",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">Carregando conversas...</div>;
  }

  return (
    <div className="min-h-[560px] overflow-hidden rounded-xl border bg-card md:h-[calc(100vh-15rem)] md:min-h-[600px]">
      <div className="flex h-full">
        <aside className={`${selectedConversation ? "hidden md:flex" : "flex"} w-full flex-col border-r md:w-80`}>
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <h2 className="font-semibold">Conversas</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={availableContacts.length === 0}><Plus className="mr-2 h-4 w-4" />Nova</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova conversa</DialogTitle>
                  <DialogDescription>Somente clientes com acesso vinculado aparecem nesta lista.</DialogDescription>
                </DialogHeader>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>
                    {availableContacts.map(contact => <SelectItem key={contact.authUserId} value={contact.authUserId}>{contact.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={createConversation} disabled={!selectedUser}>Iniciar conversa</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Buscar conversas" placeholder="Buscar conversas..." value={searchQuery} onChange={event => setSearchQuery(event.target.value)} className="pl-10" />
            </div>
          </div>
          <ScrollArea className="flex-1 px-3 pb-3">
            <div className="space-y-2">
              {filteredConversations.map(conversation => (
                <Card key={conversation.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedConversation(conversation)}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <Avatar className="h-10 w-10"><AvatarFallback>{conversation.contact.name.charAt(0)}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-medium">{conversation.contact.name}</h3>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatTime(conversation.last_message_at)}</span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{conversation.last_message || "Conversa iniciada"}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredConversations.length === 0 && (
                <div className="px-4 py-10 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p className="font-medium text-foreground">Nenhuma conversa</p>
                  <p className="mt-1 text-sm">Inicie uma conversa com um cliente vinculado.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        <section className={`${selectedConversation ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
          {selectedConversation ? (
            <>
              <header className="flex items-center gap-3 border-b p-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)} aria-label="Voltar para conversas">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10"><AvatarFallback>{selectedConversation.contact.name.charAt(0)}</AvatarFallback></Avatar>
                <div className="min-w-0"><h2 className="truncate font-medium">{selectedConversation.contact.name}</h2><p className="truncate text-sm text-muted-foreground">{selectedConversation.contact.email || "Cliente VIZZU"}</p></div>
              </header>
              <ScrollArea className="min-h-[420px] flex-1 p-4">
                <div className="space-y-3">
                  {messages.map(message => (
                    <div key={message.id} className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2 md:max-w-md ${message.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                        <p className="mt-1 text-xs opacity-70">{formatTime(message.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Envie a primeira mensagem desta conversa.</p>}
                </div>
              </ScrollArea>
              <form onSubmit={sendMessage} className="flex gap-2 border-t p-3 md:p-4">
                <Input aria-label="Mensagem" placeholder="Digite sua mensagem..." value={newMessage} onChange={event => setNewMessage(event.target.value)} maxLength={2000} />
                <Button type="submit" size="icon" disabled={sending || !newMessage.trim()} aria-label="Enviar mensagem"><Send className="h-4 w-4" /></Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div><Users className="mx-auto mb-4 h-14 w-14 text-muted-foreground" /><h2 className="text-lg font-semibold">Selecione uma conversa</h2><p className="mt-1 text-sm text-muted-foreground">As mensagens reais aparecerão aqui.</p></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ConversationsContent;
