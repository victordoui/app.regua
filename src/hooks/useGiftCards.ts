import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GiftCard {
  id: string;
  user_id: string;
  code: string;
  original_value: number;
  current_balance: number;
  buyer_name: string | null;
  buyer_email: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  message: string | null;
  expires_at: string | null;
  redeemed_at: string | null;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  created_at: string;
}

export interface GiftCardTransaction {
  id: string;
  gift_card_id: string;
  amount: number;
  type: 'purchase' | 'redeem' | 'refund';
  appointment_id: string | null;
  created_at: string;
}

export interface CreateGiftCardInput {
  original_value: number;
  buyer_name?: string;
  buyer_email?: string;
  recipient_name?: string;
  recipient_email?: string;
  message?: string;
  expires_at?: string;
}

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GC-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useGiftCards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: giftCards = [], isLoading } = useQuery({
    queryKey: ['gift-cards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GiftCard[];
    }
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['gift-card-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('gift_card_transactions')
        .select('*, gift_cards!inner(user_id)')
        .eq('gift_cards.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GiftCardTransaction[];
    }
  });

  const createGiftCard = useMutation({
    mutationFn: async (input: CreateGiftCardInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const code = generateGiftCardCode();
      
      const { data, error } = await supabase
        .from('gift_cards')
        .insert({
          user_id: user.id,
          code,
          original_value: input.original_value,
          current_balance: input.original_value,
          buyer_name: input.buyer_name,
          buyer_email: input.buyer_email,
          recipient_name: input.recipient_name,
          recipient_email: input.recipient_email,
          message: input.message,
          expires_at: input.expires_at,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Create purchase transaction
      await supabase
        .from('gift_card_transactions')
        .insert({
          gift_card_id: data.id,
          amount: input.original_value,
          type: 'purchase'
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-transactions'] });
      toast({
        title: 'Gift Card Criado',
        description: 'Vale-presente criado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o gift card.',
        variant: 'destructive',
      });
      console.error(error);
    }
  });

  const redeemGiftCard = useMutation({
    mutationFn: async ({ code, amount, appointmentId }: { code: string; amount: number; appointmentId?: string }) => {
      const { data: giftCard, error: fetchError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (fetchError || !giftCard) {
        throw new Error('Gift card não encontrado');
      }

      if (giftCard.status !== 'active') {
        throw new Error('Gift card não está ativo');
      }

      if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
        throw new Error('Gift card expirado');
      }

      if (giftCard.current_balance < amount) {
        throw new Error(`Saldo insuficiente. Saldo disponível: R$ ${giftCard.current_balance.toFixed(2)}`);
      }

      const newBalance = giftCard.current_balance - amount;
      const newStatus = newBalance === 0 ? 'used' : 'active';

      const { error: updateError } = await supabase
        .from('gift_cards')
        .update({
          current_balance: newBalance,
          status: newStatus,
          redeemed_at: newStatus === 'used' ? new Date().toISOString() : null
        })
        .eq('id', giftCard.id);

      if (updateError) throw updateError;

      // Create redeem transaction
      await supabase
        .from('gift_card_transactions')
        .insert({
          gift_card_id: giftCard.id,
          amount: -amount,
          type: 'redeem',
          appointment_id: appointmentId
        });

      return { giftCard, amountRedeemed: amount, newBalance };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-transactions'] });
      toast({
        title: 'Resgate Realizado',
        description: `R$ ${data.amountRedeemed.toFixed(2)} resgatado. Saldo restante: R$ ${data.newBalance.toFixed(2)}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro no Resgate',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const validateGiftCard = async (code: string) => {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return { valid: false, error: 'Gift card não encontrado' };
    }

    if (data.status !== 'active') {
      return { valid: false, error: 'Gift card não está ativo' };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'Gift card expirado' };
    }

    return { valid: true, giftCard: data as GiftCard };
  };

  const cancelGiftCard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gift_cards')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      toast({
        title: 'Gift Card Cancelado',
        description: 'Vale-presente foi cancelado.',
      });
    }
  });

  const stats = {
    totalActive: giftCards.filter(gc => gc.status === 'active').length,
    totalValue: giftCards.filter(gc => gc.status === 'active').reduce((sum, gc) => sum + gc.current_balance, 0),
    totalRedeemed: giftCards.filter(gc => gc.status === 'used').length,
    totalRevenue: giftCards.reduce((sum, gc) => sum + gc.original_value, 0),
  };

  return {
    giftCards,
    transactions,
    isLoading,
    createGiftCard,
    redeemGiftCard,
    validateGiftCard,
    cancelGiftCard,
    stats
  };
}
