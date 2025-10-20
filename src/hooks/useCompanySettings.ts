import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CompanySettings {
  id: string;
  user_id: string;
  company_name: string;
  slogan: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color_hex: string;
  secondary_color_hex: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_public_page_enabled: boolean;
}

export interface CompanySettingsFormData {
  company_name: string;
  slogan: string;
  primary_color_hex: string;
  secondary_color_hex: string;
  address: string;
  phone: string;
  email: string;
  is_public_page_enabled: boolean;
}

export const useCompanySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchSettings = useCallback(async (): Promise<CompanySettings | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from("barbershop_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
      throw error;
    }
    
    return data as CompanySettings | null;
  }, [user]);

  const { data: settings, isLoading, error } = useQuery<CompanySettings | null, Error>({
    queryKey: ["companySettings", user?.id],
    queryFn: fetchSettings,
    enabled: !!user,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const saveSettingsMutation = useMutation<CompanySettings, Error, CompanySettingsFormData>({
    mutationFn: async (formData) => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const payload = {
        user_id: user.id,
        company_name: formData.company_name,
        slogan: formData.slogan || null,
        primary_color_hex: formData.primary_color_hex,
        secondary_color_hex: formData.secondary_color_hex,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        is_public_page_enabled: formData.is_public_page_enabled,
      };

      if (settings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from("barbershop_settings")
          .update(payload)
          .eq("id", settings.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from("barbershop_settings")
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companySettings", user?.id] });
      toast({ title: "Configurações salvas com sucesso!" });
    },
    onError: (err) => {
      toast({
        title: "Erro ao salvar configurações",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings: settings,
    isLoading,
    saveSettings: saveSettingsMutation.mutateAsync,
    isSaving: saveSettingsMutation.isPending,
  };
};