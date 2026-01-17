import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Plus, Send, Users, Search, Circle } from 'lucide-react';
import { useTeamChat, ChatConversation, ChatMessage } from '@/hooks/useTeamChat';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NewConversationDialog = ({ 
  teamMembers, 
  currentUserId,
  onCreateConversation 
}: { 
  teamMembers: any[];
  currentUserId: string | null;
  onCreateConversation: (participantIds: string[], isGroup: boolean, groupName?: string) => void;
}) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const availableMembers = teamMembers.filter(m => m.id !== currentUserId);

  const handleCreate = () => {
    if (selectedMembers.length === 0) return;
    onCreateConversation(selectedMembers, isGroup, groupName || undefined);
    setIsOpen(false);
    setSelectedMembers([]);
    setGroupName('');
    setIsGroup(false);
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isGroup}
              onChange={(e) => setIsGroup(e.target.checked)}
              id="is-group"
              className="rounded"
            />
            <label htmlFor="is-group" className="text-sm">Criar grupo</label>
          </div>

          {isGroup && (
            <Input
              placeholder="Nome do grupo"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Selecione os participantes:</p>
            {availableMembers.map(member => (
              <div 
                key={member.id}
                onClick={() => toggleMember(member.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedMembers.includes(member.id) ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>{member.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{member.display_name}</p>
                </div>
                {selectedMembers.includes(member.id) && (
                  <Badge variant="secondary">Selecionado</Badge>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={selectedMembers.length === 0}>
              Criar Conversa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ConversationSidebar = ({
  conversations,
  teamMembers,
  currentUserId,
  selectedId,
  onSelect,
  onCreateConversation
}: {
  conversations: ChatConversation[];
  teamMembers: any[];
  currentUserId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateConversation: (participantIds: string[], isGroup: boolean, groupName?: string) => void;
}) => {
  const [search, setSearch] = useState('');

  const getConversationName = (conv: ChatConversation) => {
    if (conv.is_group && conv.group_name) {
      return conv.group_name;
    }
    const otherParticipant = conv.participant_ids.find(id => id !== currentUserId);
    const member = teamMembers.find(m => m.id === otherParticipant);
    return member?.display_name || 'Conversa';
  };

  const getConversationAvatar = (conv: ChatConversation) => {
    if (conv.is_group) {
      return null;
    }
    const otherParticipant = conv.participant_ids.find(id => id !== currentUserId);
    const member = teamMembers.find(m => m.id === otherParticipant);
    return member?.avatar_url;
  };

  return (
    <div className="w-80 border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Conversas</h2>
          <NewConversationDialog 
            teamMembers={teamMembers}
            currentUserId={currentUserId}
            onCreateConversation={onCreateConversation}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations
            .filter(conv => {
              const name = getConversationName(conv).toLowerCase();
              return name.includes(search.toLowerCase());
            })
            .map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedId === conv.id ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getConversationAvatar(conv) || undefined} />
                  <AvatarFallback>
                    {conv.is_group ? <Users className="h-5 w-5" /> : getConversationName(conv).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{getConversationName(conv)}</p>
                  {conv.last_message && (
                    <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                  )}
                </div>
                {conv.last_message_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conv.last_message_at), { 
                      addSuffix: false, 
                      locale: ptBR 
                    })}
                  </span>
                )}
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const ChatWindow = ({
  conversationId,
  currentUserId,
  teamMembers,
  getMessages,
  sendMessage,
  subscribeToConversation
}: {
  conversationId: string;
  currentUserId: string | null;
  teamMembers: any[];
  getMessages: (id: string) => any;
  sendMessage: any;
  subscribeToConversation: (id: string) => () => void;
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = getMessages(conversationId);

  useEffect(() => {
    const unsubscribe = subscribeToConversation(conversationId);
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({
      conversationId,
      content: message
    });
    setMessage('');
  };

  const getSenderName = (senderId: string) => {
    if (senderId === currentUserId) return 'Você';
    const member = teamMembers.find(m => m.id === senderId);
    return member?.display_name || 'Desconhecido';
  };

  const getSenderAvatar = (senderId: string) => {
    const member = teamMembers.find(m => m.id === senderId);
    return member?.avatar_url;
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhuma mensagem ainda</p>
          ) : (
            messages.map((msg: ChatMessage) => {
              const isOwn = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={getSenderAvatar(msg.sender_id) || undefined} />
                    <AvatarFallback>{getSenderName(msg.sender_id).charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                    <p className="text-xs text-muted-foreground mb-1">
                      {getSenderName(msg.sender_id)} · {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                    <div className={`inline-block px-4 py-2 rounded-2xl ${
                      isOwn 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-muted rounded-tl-none'
                    }`}>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const TeamChat = () => {
  const { 
    conversations, 
    teamMembers, 
    loadingConversations, 
    currentUserId,
    getMessages,
    createConversation,
    sendMessage,
    subscribeToConversation 
  } = useTeamChat();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const handleCreateConversation = (participantIds: string[], isGroup: boolean, groupName?: string) => {
    createConversation.mutate({ participantIds, isGroup, groupName });
    // Note: Since this is a mock, we can't get the actual conversation ID back
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            Chat da Equipe
          </h1>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <ConversationSidebar
            conversations={conversations}
            teamMembers={teamMembers}
            currentUserId={currentUserId}
            selectedId={selectedConversation}
            onSelect={setSelectedConversation}
            onCreateConversation={handleCreateConversation}
          />

          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation}
              currentUserId={currentUserId}
              teamMembers={teamMembers}
              getMessages={getMessages}
              sendMessage={sendMessage}
              subscribeToConversation={subscribeToConversation}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeamChat;
