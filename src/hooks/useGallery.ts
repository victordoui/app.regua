import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GalleryItem {
  id: string;
  user_id: string;
  barber_id: string | null;
  service_id: string | null;
  image_url: string;
  title: string | null;
  description: string | null;
  created_at: string;
  barber?: { display_name: string } | null;
  service?: { name: string } | null;
}

export interface GalleryFormData {
  barber_id?: string;
  service_id?: string;
  image_url: string;
  title?: string;
  description?: string;
}

export const useGallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchGallery = useCallback(async (): Promise<GalleryItem[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with related data
    const barberIds = [...new Set(data?.map(g => g.barber_id).filter(Boolean))];
    const serviceIds = [...new Set(data?.map(g => g.service_id).filter(Boolean))];

    const [barbersRes, servicesRes] = await Promise.all([
      barberIds.length > 0 
        ? supabase.from('profiles').select('id, display_name').in('id', barberIds)
        : { data: [] },
      serviceIds.length > 0
        ? supabase.from('services').select('id, name').in('id', serviceIds)
        : { data: [] }
    ]);

    const barbersMap = new Map<string, { id: string; display_name: string }>();
    barbersRes.data?.forEach(b => barbersMap.set(b.id, b));
    const servicesMap = new Map<string, { id: string; name: string }>();
    servicesRes.data?.forEach(s => servicesMap.set(s.id, s));

    return (data || []).map(item => ({
      ...item,
      barber: item.barber_id ? barbersMap.get(item.barber_id) || null : null,
      service: item.service_id ? servicesMap.get(item.service_id) || null : null
    }));
  }, [user]);

  const { data: gallery = [], isLoading, error } = useQuery({
    queryKey: ['gallery', user?.id],
    queryFn: fetchGallery,
    enabled: !!user
  });

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('gallery').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const addGalleryItemMutation = useMutation({
    mutationFn: async (formData: GalleryFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('gallery')
        .insert({
          user_id: user.id,
          barber_id: formData.barber_id || null,
          service_id: formData.service_id || null,
          image_url: formData.image_url,
          title: formData.title || null,
          description: formData.description || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      toast({ title: 'Imagem adicionada à galeria!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao adicionar imagem', description: error.message, variant: 'destructive' });
    }
  });

  const deleteGalleryItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Get item to delete from storage
      const item = gallery.find(g => g.id === itemId);
      if (item?.image_url) {
        const path = item.image_url.split('/gallery/')[1];
        if (path) {
          await supabase.storage.from('gallery').remove([path]);
        }
      }

      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      toast({ title: 'Imagem removida da galeria!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover imagem', description: error.message, variant: 'destructive' });
    }
  });

  const updateGalleryItemMutation = useMutation({
    mutationFn: async ({ id, ...formData }: Partial<GalleryFormData> & { id: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('gallery')
        .update({
          barber_id: formData.barber_id,
          service_id: formData.service_id,
          title: formData.title,
          description: formData.description
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      toast({ title: 'Imagem atualizada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar imagem', description: error.message, variant: 'destructive' });
    }
  });

  return {
    gallery,
    isLoading,
    error,
    uploadImage,
    addGalleryItem: addGalleryItemMutation.mutateAsync,
    updateGalleryItem: updateGalleryItemMutation.mutateAsync,
    deleteGalleryItem: deleteGalleryItemMutation.mutateAsync,
    isAdding: addGalleryItemMutation.isPending,
    isUpdating: updateGalleryItemMutation.isPending,
    isDeleting: deleteGalleryItemMutation.isPending
  };
};
