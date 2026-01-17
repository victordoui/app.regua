import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface ServiceCombo {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  services?: ComboService[];
}

export interface ComboService {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

export interface ServiceComboFormData {
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  active: boolean;
  image_url: string;
  service_ids: string[];
}

export function useServiceCombos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all combos for the current user
  const { data: combos = [], isLoading, refetch } = useQuery({
    queryKey: ['service-combos', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: combosData, error } = await supabase
        .from('service_combos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch services for each combo
      const combosWithServices: ServiceCombo[] = await Promise.all(
        (combosData || []).map(async (combo) => {
          const { data: itemsData } = await supabase
            .from('service_combo_items')
            .select('service_id')
            .eq('combo_id', combo.id);

          const serviceIds = itemsData?.map(item => item.service_id) || [];

          if (serviceIds.length > 0) {
            const { data: servicesData } = await supabase
              .from('services')
              .select('id, name, price, duration_minutes')
              .in('id', serviceIds);

            return {
              ...combo,
              discount_type: combo.discount_type as 'percentage' | 'fixed',
              services: servicesData?.map(s => ({
                id: s.id,
                name: s.name,
                price: Number(s.price),
                duration_minutes: s.duration_minutes
              })) || []
            };
          }

          return {
            ...combo,
            discount_type: combo.discount_type as 'percentage' | 'fixed',
            services: []
          };
        })
      );

      return combosWithServices;
    },
    enabled: !!user
  });

  // Create a new combo
  const createCombo = useMutation({
    mutationFn: async (formData: ServiceComboFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Insert the combo
      const { data: combo, error } = await supabase
        .from('service_combos')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          active: formData.active,
          image_url: formData.image_url || null
        })
        .select()
        .single();

      if (error) throw error;

      // Insert combo items
      if (formData.service_ids.length > 0) {
        const { error: itemsError } = await supabase
          .from('service_combo_items')
          .insert(
            formData.service_ids.map(serviceId => ({
              combo_id: combo.id,
              service_id: serviceId
            }))
          );

        if (itemsError) throw itemsError;
      }

      return combo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-combos'] });
      toast.success('Combo criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating combo:', error);
      toast.error('Erro ao criar combo');
    }
  });

  // Update a combo
  const updateCombo = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: ServiceComboFormData }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Update the combo
      const { error } = await supabase
        .from('service_combos')
        .update({
          name: formData.name,
          description: formData.description || null,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          active: formData.active,
          image_url: formData.image_url || null
        })
        .eq('id', id);

      if (error) throw error;

      // Delete existing items and re-insert
      const { error: deleteError } = await supabase
        .from('service_combo_items')
        .delete()
        .eq('combo_id', id);

      if (deleteError) throw deleteError;

      // Insert new items
      if (formData.service_ids.length > 0) {
        const { error: itemsError } = await supabase
          .from('service_combo_items')
          .insert(
            formData.service_ids.map(serviceId => ({
              combo_id: id,
              service_id: serviceId
            }))
          );

        if (itemsError) throw itemsError;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-combos'] });
      toast.success('Combo atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating combo:', error);
      toast.error('Erro ao atualizar combo');
    }
  });

  // Delete a combo
  const deleteCombo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_combos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-combos'] });
      toast.success('Combo excluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting combo:', error);
      toast.error('Erro ao excluir combo');
    }
  });

  // Toggle combo active status
  const toggleComboStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('service_combos')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
      return { id, active };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-combos'] });
      toast.success(data.active ? 'Combo ativado!' : 'Combo desativado!');
    },
    onError: (error: any) => {
      console.error('Error toggling combo status:', error);
      toast.error('Erro ao alterar status do combo');
    }
  });

  return {
    combos,
    isLoading,
    refetch,
    createCombo,
    updateCombo,
    deleteCombo,
    toggleComboStatus
  };
}

// Utility function to calculate combo price
export function calculateComboPrice(
  services: ComboService[],
  discountType: 'percentage' | 'fixed',
  discountValue: number
): { originalPrice: number; finalPrice: number; savings: number } {
  const originalPrice = services.reduce((sum, s) => sum + s.price, 0);
  
  let finalPrice: number;
  if (discountType === 'percentage') {
    finalPrice = originalPrice * (1 - discountValue / 100);
  } else {
    finalPrice = Math.max(0, originalPrice - discountValue);
  }
  
  return {
    originalPrice,
    finalPrice: Math.round(finalPrice * 100) / 100,
    savings: Math.round((originalPrice - finalPrice) * 100) / 100
  };
}

// Hook to fetch active combos for public booking
export function usePublicCombos(userId?: string) {
  return useQuery({
    queryKey: ['public-combos', userId],
    queryFn: async () => {
      let query = supabase
        .from('service_combos')
        .select('*')
        .eq('active', true);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: combosData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch services for each combo
      const combosWithServices: ServiceCombo[] = await Promise.all(
        (combosData || []).map(async (combo) => {
          const { data: itemsData } = await supabase
            .from('service_combo_items')
            .select('service_id')
            .eq('combo_id', combo.id);

          const serviceIds = itemsData?.map(item => item.service_id) || [];

          if (serviceIds.length > 0) {
            const { data: servicesData } = await supabase
              .from('services')
              .select('id, name, price, duration_minutes')
              .in('id', serviceIds);

            return {
              ...combo,
              discount_type: combo.discount_type as 'percentage' | 'fixed',
              services: servicesData?.map(s => ({
                id: s.id,
                name: s.name,
                price: Number(s.price),
                duration_minutes: s.duration_minutes
              })) || []
            };
          }

          return {
            ...combo,
            discount_type: combo.discount_type as 'percentage' | 'fixed',
            services: []
          };
        })
      );

      return combosWithServices;
    },
    enabled: true
  });
}
