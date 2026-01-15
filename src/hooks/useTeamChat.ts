import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export interface ChatConversation {
  id: string;
  user_id: string;
  participant_ids: string[];
  is_group: boolean;
  group_name: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url: string | null;
  read_by: string[];
  created_at: string;
}

export interface ChatParticipant {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_online: boolean;
}

export function useTeamChat() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['team-conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('team_conversations')
        .select('*')
        .contains('participant_ids', [user.id])
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as ChatConversation[];
    }
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, is_online')
        .eq('active', true);

      if (error) throw error;
      return data as ChatParticipant[];
    }
  });

  const getMessages = (conversationId: string) => {
    return useQuery({
      queryKey: ['team-messages', conversationId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('team_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data as ChatMessage[];
      },
      enabled: !!conversationId
    });
  };

  const createConversation = useMutation({
    mutationFn: async ({ participantIds, isGroup, groupName }: {
      participantIds: string[];
      isGroup?: boolean;
      groupName?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const allParticipants = [...new Set([user.id, ...participantIds])];

      // Check if 1:1 conversation already exists
      if (!isGroup && allParticipants.length === 2) {
        const existing = conversations.find(
          c => !c.is_group && 
               c.participant_ids.length === 2 &&
               c.participant_ids.includes(allParticipants[0]) &&
               c.participant_ids.includes(allParticipants[1])
        );
        if (existing) return existing;
      }

      const { data, error } = await supabase
        .from('team_conversations')
        .insert({
          user_id: user.id,
          participant_ids: allParticipants,
          is_group: isGroup || false,
          group_name: groupName
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-conversations'] });
    }
  });

  const sendMessage = useMutation({
    mutationFn: async ({ conversationId, content, messageType = 'text', fileUrl }: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'image' | 'file';
      fileUrl?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('team_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
          read_by: [user.id]
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation last message
      await supabase
        .from('team_conversations')
        .update({
          last_message: content.substring(0, 100),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-messages', data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['team-conversations'] });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Get unread messages
      const { data: unreadMessages } = await supabase
        .from('team_messages')
        .select('id, read_by')
        .eq('conversation_id', conversationId)
        .not('read_by', 'cs', `{${user.id}}`);

      if (!unreadMessages || unreadMessages.length === 0) return;

      // Update each message to include current user in read_by
      for (const msg of unreadMessages) {
        await supabase
          .from('team_messages')
          .update({
            read_by: [...(msg.read_by || []), user.id]
          })
          .eq('id', msg.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-messages'] });
    }
  });

  // Subscribe to real-time messages
  const subscribeToConversation = (conversationId: string) => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['team-messages', conversationId] });
          
          // Show notification if not from current user
          if (payload.new.sender_id !== currentUserId) {
            toast({
              title: 'Nova mensagem',
              description: payload.new.content.substring(0, 50) + '...',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getUnreadCount = (conversationId?: string) => {
    // This would require a more complex query to count unread messages
    return 0;
  };

  const getParticipantName = (participantId: string) => {
    const member = teamMembers.find(m => m.id === participantId);
    return member?.display_name || 'Desconhecido';
  };

  return {
    conversations,
    teamMembers,
    loadingConversations,
    currentUserId,
    getMessages,
    createConversation,
    sendMessage,
    markAsRead,
    subscribeToConversation,
    getUnreadCount,
    getParticipantName
  };
}
