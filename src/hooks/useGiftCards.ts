import { useState } from 'react';
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

// This hook provides gift card functionality
// Note: Requires 'gift_cards' and 'gift_card_transactions' tables to be created in Supabase
export function useGiftCards() {
  const { toast } = useToast();
  const [giftCards] = useState<GiftCard[]>([]);
  const [transactions] = useState<GiftCardTransaction[]>([]);
  const [isLoading] = useState(false);

  const createGiftCard = {
    mutate: async (_input: CreateGiftCardInput) => null,
    mutateAsync: async (_input: CreateGiftCardInput) => null,
    isPending: false
  };

  const redeemGiftCard = {
    mutate: async (_data: { code: string; amount: number; appointmentId?: string }) => ({ giftCard: null, amountRedeemed: 0, newBalance: 0 }),
    mutateAsync: async (_data: { code: string; amount: number; appointmentId?: string }) => ({ giftCard: null, amountRedeemed: 0, newBalance: 0 }),
    isPending: false
  };

  const validateGiftCard = async (_code: string): Promise<{ valid: boolean; error?: string; giftCard?: GiftCard }> => {
    return { valid: false, error: 'Tabela gift_cards não encontrada' };
  };

  const cancelGiftCard = {
    mutate: async (_id: string) => {},
    mutateAsync: async (_id: string) => {},
    isPending: false
  };

  const stats = {
    totalActive: 0,
    totalValue: 0,
    totalRedeemed: 0,
    totalRevenue: 0,
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
