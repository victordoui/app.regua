import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  user_id: string;
  appointment_id: string | null;
  client_id: string | null;
  barber_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  client?: { name: string } | null;
  barber?: { display_name: string } | null;
  service?: { name: string } | null;
}

export interface ReviewFormData {
  appointment_id?: string;
  client_id?: string;
  barber_id?: string;
  rating: number;
  comment?: string;
}

export const useReviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchReviews = useCallback(async (): Promise<Review[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with related data
    const clientIds = [...new Set(data?.map(r => r.client_id).filter(Boolean))];
    const barberIds = [...new Set(data?.map(r => r.barber_id).filter(Boolean))];

    const [clientsRes, barbersRes] = await Promise.all([
      clientIds.length > 0 
        ? supabase.from('clients').select('id, name').in('id', clientIds)
        : { data: [] },
      barberIds.length > 0
        ? supabase.from('profiles').select('id, display_name').in('id', barberIds)
        : { data: [] }
    ]);

    const clientsMap = new Map<string, { id: string; name: string }>();
    clientsRes.data?.forEach(c => clientsMap.set(c.id, c));
    const barbersMap = new Map<string, { id: string; display_name: string }>();
    barbersRes.data?.forEach(b => barbersMap.set(b.id, b));

    return (data || []).map(review => ({
      ...review,
      client: review.client_id ? clientsMap.get(review.client_id) || null : null,
      barber: review.barber_id ? barbersMap.get(review.barber_id) || null : null
    }));
  }, [user]);

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['reviews', user?.id],
    queryFn: fetchReviews,
    enabled: !!user
  });

  const addReviewMutation = useMutation({
    mutationFn: async (formData: ReviewFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          appointment_id: formData.appointment_id || null,
          client_id: formData.client_id || null,
          barber_id: formData.barber_id || null,
          rating: formData.rating,
          comment: formData.comment || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Avaliação registrada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao registrar avaliação', description: error.message, variant: 'destructive' });
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Avaliação removida com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover avaliação', description: error.message, variant: 'destructive' });
    }
  });

  // Calculate stats
  const stats = {
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0,
    ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length
    }))
  };

  return {
    reviews,
    isLoading,
    error,
    stats,
    addReview: addReviewMutation.mutateAsync,
    deleteReview: deleteReviewMutation.mutateAsync,
    isAdding: addReviewMutation.isPending,
    isDeleting: deleteReviewMutation.isPending
  };
};
