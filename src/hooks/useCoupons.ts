import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DiscountCoupon {
  id: string;
  user_id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

export interface CouponFormData {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  max_uses?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  active?: boolean;
}

export const useCoupons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchCoupons = useCallback(async (): Promise<DiscountCoupon[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('discount_coupons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DiscountCoupon[];
  }, [user]);

  const { data: coupons = [], isLoading, error } = useQuery({
    queryKey: ['coupons', user?.id],
    queryFn: fetchCoupons,
    enabled: !!user
  });

  const addCouponMutation = useMutation({
    mutationFn: async (formData: CouponFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('discount_coupons')
        .insert({
          user_id: user.id,
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          min_purchase: formData.min_purchase || 0,
          max_uses: formData.max_uses || null,
          valid_from: formData.valid_from || null,
          valid_until: formData.valid_until || null,
          active: formData.active ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({ title: 'Cupom criado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar cupom', description: error.message, variant: 'destructive' });
    }
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, ...formData }: Partial<CouponFormData> & { id: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const updateData: Record<string, unknown> = {};
      if (formData.code !== undefined) updateData.code = formData.code.toUpperCase();
      if (formData.discount_type !== undefined) updateData.discount_type = formData.discount_type;
      if (formData.discount_value !== undefined) updateData.discount_value = formData.discount_value;
      if (formData.min_purchase !== undefined) updateData.min_purchase = formData.min_purchase;
      if (formData.max_uses !== undefined) updateData.max_uses = formData.max_uses;
      if (formData.valid_from !== undefined) updateData.valid_from = formData.valid_from;
      if (formData.valid_until !== undefined) updateData.valid_until = formData.valid_until;
      if (formData.active !== undefined) updateData.active = formData.active;

      const { data, error } = await supabase
        .from('discount_coupons')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({ title: 'Cupom atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar cupom', description: error.message, variant: 'destructive' });
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('discount_coupons')
        .delete()
        .eq('id', couponId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({ title: 'Cupom removido!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover cupom', description: error.message, variant: 'destructive' });
    }
  });

  const validateCoupon = async (code: string, purchaseAmount: number): Promise<{ valid: boolean; discount: number; message: string }> => {
    const coupon = coupons.find(c => c.code === code.toUpperCase() && c.active);
    
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Cupom não encontrado' };
    }

    const today = new Date().toISOString().split('T')[0];
    
    if (coupon.valid_from && today < coupon.valid_from) {
      return { valid: false, discount: 0, message: 'Cupom ainda não válido' };
    }

    if (coupon.valid_until && today > coupon.valid_until) {
      return { valid: false, discount: 0, message: 'Cupom expirado' };
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return { valid: false, discount: 0, message: 'Cupom esgotado' };
    }

    if (purchaseAmount < coupon.min_purchase) {
      return { valid: false, discount: 0, message: `Valor mínimo: R$ ${coupon.min_purchase.toFixed(2)}` };
    }

    const discount = coupon.discount_type === 'percent'
      ? (purchaseAmount * coupon.discount_value) / 100
      : Math.min(coupon.discount_value, purchaseAmount);

    return { valid: true, discount, message: 'Cupom aplicado!' };
  };

  return {
    coupons,
    isLoading,
    error,
    addCoupon: addCouponMutation.mutateAsync,
    updateCoupon: updateCouponMutation.mutateAsync,
    deleteCoupon: deleteCouponMutation.mutateAsync,
    validateCoupon,
    isAdding: addCouponMutation.isPending,
    isUpdating: updateCouponMutation.isPending,
    isDeleting: deleteCouponMutation.isPending
  };
};
