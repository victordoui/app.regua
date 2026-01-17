import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

// This hook provides team chat functionality
// Note: Requires 'team_conversations' and 'team_messages' tables to be created in Supabase
export function useTeamChat() {
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations] = useState<ChatConversation[]>([]);
  const [teamMembers, setTeamMembers] = useState<ChatParticipant[]>([]);
  const [loadingConversations] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Fetch team members from profiles (this works with existing table)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .eq('active', true);
        
        if (data) {
          setTeamMembers(data.map(p => ({
            id: p.id,
            display_name: p.display_name || 'Sem nome',
            avatar_url: p.avatar_url,
            is_online: false
          })));
        }
      }
    };
    getUser();
  }, []);

  const getMessages = useCallback((_conversationId: string) => {
    return {
      data: [] as ChatMessage[],
      isLoading: false
    };
  }, []);

  const createConversation = {
    mutate: async (_data: { participantIds: string[]; isGroup?: boolean; groupName?: string }) => null,
    mutateAsync: async (_data: { participantIds: string[]; isGroup?: boolean; groupName?: string }) => null,
    isPending: false
  };

  const sendMessage = {
    mutate: async (_data: { conversationId: string; content: string; messageType?: string; fileUrl?: string }) => null,
    mutateAsync: async (_data: { conversationId: string; content: string; messageType?: string; fileUrl?: string }) => null,
    isPending: false
  };

  const markAsRead = {
    mutate: async (_conversationId: string) => {},
    mutateAsync: async (_conversationId: string) => {},
    isPending: false
  };

  const subscribeToConversation = useCallback((_conversationId: string) => {
    return () => {};
  }, []);

  const getUnreadCount = useCallback((_conversationId?: string) => {
    return 0;
  }, []);

  const getParticipantName = useCallback((participantId: string) => {
    const member = teamMembers.find(m => m.id === participantId);
    return member?.display_name || 'Desconhecido';
  }, [teamMembers]);

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
