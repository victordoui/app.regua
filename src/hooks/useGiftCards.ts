import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  updated_at: string;
}

export interface GiftCardTransaction {
  id: string;
  gift_card_id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'redeem' | 'refund';
  appointment_id: string | null;
  notes: string | null;
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

export interface RedeemGiftCardInput {
  code: string;
  amount: number;
  appointmentId?: string;
  notes?: string;
}

export interface ValidateResult {
  valid: boolean;
  error?: string;
  giftCard?: GiftCard;
}

// Gera código único no formato GC-XXXX-XXXX
const generateUniqueCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem I, O, 0, 1 para evitar confusão
  let code = 'GC-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function useGiftCards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all gift cards for current user
  const fetchGiftCards = useCallback(async (): Promise<GiftCard[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gift cards:', error);
      throw error;
    }

    return (data || []) as GiftCard[];
  }, [user]);

  // Fetch all transactions for current user
  const fetchTransactions = useCallback(async (): Promise<GiftCardTransaction[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('gift_card_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return (data || []) as GiftCardTransaction[];
  }, [user]);

  // Query for gift cards
  const {
    data: giftCards = [],
    isLoading,
    error,
    refetch: refetchGiftCards
  } = useQuery({
    queryKey: ['gift-cards', user?.id],
    queryFn: fetchGiftCards,
    enabled: !!user,
  });

  // Query for transactions
  const { data: transactions = [], refetch: refetchTransactions } = useQuery({
    queryKey: ['gift-card-transactions', user?.id],
    queryFn: fetchTransactions,
    enabled: !!user,
  });

  // Create a new gift card
  const createGiftCardMutation = useMutation({
    mutationFn: async (input: CreateGiftCardInput) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Generate unique code
      let code = generateUniqueCode();
      let attempts = 0;
      const maxAttempts = 10;

      // Check for code uniqueness
      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('gift_cards')
          .select('id')
          .eq('code', code)
          .maybeSingle();

        if (!existing) break;
        code = generateUniqueCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Não foi possível gerar um código único');
      }

      // Insert gift card
      const { data: giftCard, error: giftCardError } = await supabase
        .from('gift_cards')
        .insert({
          user_id: user.id,
          code,
          original_value: input.original_value,
          current_balance: input.original_value,
          buyer_name: input.buyer_name || null,
          buyer_email: input.buyer_email || null,
          recipient_name: input.recipient_name || null,
          recipient_email: input.recipient_email || null,
          message: input.message || null,
          expires_at: input.expires_at || null,
          status: 'active',
        })
        .select()
        .single();

      if (giftCardError) throw giftCardError;

      // Create purchase transaction
      const { error: transactionError } = await supabase
        .from('gift_card_transactions')
        .insert({
          gift_card_id: giftCard.id,
          user_id: user.id,
          amount: input.original_value,
          type: 'purchase',
          notes: `Gift card criado para ${input.recipient_name || 'cliente'}`,
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
      }

      return giftCard as GiftCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-transactions'] });
      toast({
        title: 'Gift Card criado!',
        description: 'O vale-presente foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar Gift Card',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Validate a gift card by code (public function)
  const validateGiftCard = useCallback(async (code: string): Promise<ValidateResult> => {
    const normalizedCode = code.toUpperCase().trim();

    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', normalizedCode)
      .maybeSingle();

    if (error) {
      return { valid: false, error: 'Erro ao validar código' };
    }

    if (!data) {
      return { valid: false, error: 'Código não encontrado' };
    }

    const giftCard = data as GiftCard;

    if (giftCard.status === 'cancelled') {
      return { valid: false, error: 'Gift card cancelado' };
    }

    if (giftCard.status === 'expired') {
      return { valid: false, error: 'Gift card expirado' };
    }

    if (giftCard.status === 'used' || giftCard.current_balance <= 0) {
      return { valid: false, error: 'Gift card sem saldo disponível' };
    }

    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('gift_cards')
        .update({ status: 'expired' })
        .eq('id', giftCard.id);

      return { valid: false, error: 'Gift card expirado' };
    }

    return { valid: true, giftCard };
  }, []);

  // Redeem a gift card
  const redeemGiftCardMutation = useMutation({
    mutationFn: async (input: RedeemGiftCardInput): Promise<{
      giftCard: GiftCard;
      amountRedeemed: number;
      newBalance: number;
    }> => {
      if (!user) throw new Error('Usuário não autenticado');

      // Validate first
      const validation = await validateGiftCard(input.code);
      if (!validation.valid || !validation.giftCard) {
        throw new Error(validation.error || 'Gift card inválido');
      }

      const giftCard = validation.giftCard;

      if (input.amount <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }

      if (input.amount > giftCard.current_balance) {
        throw new Error(`Saldo insuficiente. Disponível: R$ ${giftCard.current_balance.toFixed(2)}`);
      }

      const newBalance = giftCard.current_balance - input.amount;
      const newStatus = newBalance <= 0 ? 'used' : 'active';

      // Update gift card balance
      const { data: updatedCard, error: updateError } = await supabase
        .from('gift_cards')
        .update({
          current_balance: newBalance,
          status: newStatus,
          redeemed_at: newBalance <= 0 ? new Date().toISOString() : giftCard.redeemed_at,
        })
        .eq('id', giftCard.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create redeem transaction
      const { error: transactionError } = await supabase
        .from('gift_card_transactions')
        .insert({
          gift_card_id: giftCard.id,
          user_id: user.id,
          amount: -input.amount, // Negative for redemption
          type: 'redeem',
          appointment_id: input.appointmentId || null,
          notes: input.notes || `Resgate de R$ ${input.amount.toFixed(2)}`,
        });

      if (transactionError) {
        console.error('Error creating redeem transaction:', transactionError);
      }

      return {
        giftCard: updatedCard as GiftCard,
        amountRedeemed: input.amount,
        newBalance,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-transactions'] });
      toast({
        title: 'Gift Card resgatado!',
        description: `R$ ${result.amountRedeemed.toFixed(2)} utilizado. Saldo restante: R$ ${result.newBalance.toFixed(2)}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao resgatar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel a gift card
  const cancelGiftCardMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('gift_cards')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      toast({
        title: 'Gift Card cancelado',
        description: 'O vale-presente foi cancelado.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao cancelar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Refund a gift card (add balance back)
  const refundGiftCardMutation = useMutation({
    mutationFn: async ({ id, amount, notes }: { id: string; amount: number; notes?: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Get current gift card
      const { data: giftCard, error: fetchError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !giftCard) throw new Error('Gift card não encontrado');

      const newBalance = Number(giftCard.current_balance) + amount;
      const newStatus = newBalance > 0 ? 'active' : giftCard.status;

      // Update balance
      const { error: updateError } = await supabase
        .from('gift_cards')
        .update({
          current_balance: newBalance,
          status: newStatus,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Create refund transaction
      await supabase
        .from('gift_card_transactions')
        .insert({
          gift_card_id: id,
          user_id: user.id,
          amount: amount, // Positive for refund
          type: 'refund',
          notes: notes || `Estorno de R$ ${amount.toFixed(2)}`,
        });

      return { newBalance };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      queryClient.invalidateQueries({ queryKey: ['gift-card-transactions'] });
      toast({
        title: 'Estorno realizado!',
        description: `Novo saldo: R$ ${result.newBalance.toFixed(2)}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao estornar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const activeCards = giftCards.filter(gc => gc.status === 'active');
    const usedCards = giftCards.filter(gc => gc.status === 'used');

    return {
      totalActive: activeCards.length,
      totalValue: activeCards.reduce((sum, gc) => sum + Number(gc.current_balance), 0),
      totalRedeemed: usedCards.length,
      totalRevenue: giftCards.reduce((sum, gc) => sum + Number(gc.original_value), 0),
    };
  }, [giftCards]);

  // Get transactions for a specific gift card
  const getTransactionsForCard = useCallback((giftCardId: string) => {
    return transactions.filter(t => t.gift_card_id === giftCardId);
  }, [transactions]);

  return {
    // Data
    giftCards,
    transactions,
    isLoading,
    error,

    // Statistics
    stats,

    // Mutations
    createGiftCard: {
      mutate: createGiftCardMutation.mutate,
      mutateAsync: createGiftCardMutation.mutateAsync,
      isPending: createGiftCardMutation.isPending,
    },
    redeemGiftCard: {
      mutate: redeemGiftCardMutation.mutate,
      mutateAsync: redeemGiftCardMutation.mutateAsync,
      isPending: redeemGiftCardMutation.isPending,
    },
    cancelGiftCard: {
      mutate: cancelGiftCardMutation.mutate,
      mutateAsync: cancelGiftCardMutation.mutateAsync,
      isPending: cancelGiftCardMutation.isPending,
    },
    refundGiftCard: {
      mutate: refundGiftCardMutation.mutate,
      mutateAsync: refundGiftCardMutation.mutateAsync,
      isPending: refundGiftCardMutation.isPending,
    },

    // Functions
    validateGiftCard,
    getTransactionsForCard,

    // Refetch
    refetch: () => {
      refetchGiftCards();
      refetchTransactions();
    },
  };
}
