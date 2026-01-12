import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FavoriteBarber {
  id: string;
  barber_id: string;
  client_profile_id: string;
  barbershop_user_id: string;
  created_at: string;
}

export const useFavoriteBarbers = (clientProfileId: string | null, barbershopUserId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<FavoriteBarber[]>({
    queryKey: ["favoriteBarbers", clientProfileId],
    queryFn: async () => {
      if (!clientProfileId) return [];
      
      const { data, error } = await supabase
        .from("favorite_barbers")
        .select("*")
        .eq("client_profile_id", clientProfileId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientProfileId,
  });

  const addFavorite = useMutation({
    mutationFn: async (barberId: string) => {
      if (!clientProfileId || !barbershopUserId) {
        throw new Error("Client profile or barbershop not found");
      }

      const { data, error } = await supabase
        .from("favorite_barbers")
        .insert({
          barber_id: barberId,
          client_profile_id: clientProfileId,
          barbershop_user_id: barbershopUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteBarbers", clientProfileId] });
      toast({ title: "Barbeiro adicionado aos favoritos!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar favorito",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (barberId: string) => {
      if (!clientProfileId) throw new Error("Client profile not found");

      const { error } = await supabase
        .from("favorite_barbers")
        .delete()
        .eq("client_profile_id", clientProfileId)
        .eq("barber_id", barberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteBarbers", clientProfileId] });
      toast({ title: "Barbeiro removido dos favoritos" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover favorito",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isFavorite = (barberId: string) => {
    return favorites.some((f) => f.barber_id === barberId);
  };

  const toggleFavorite = (barberId: string) => {
    if (isFavorite(barberId)) {
      removeFavorite.mutate(barberId);
    } else {
      addFavorite.mutate(barberId);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
  };
};
