import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  min_stock: number;
  category: string | null;
  barcode: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  user_id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string | null;
  created_at: string;
  product?: { name: string } | null;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  min_stock?: number;
  category?: string;
  barcode?: string;
  active?: boolean;
}

export interface StockMovementFormData {
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  reason?: string;
}

export const useInventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      min_stock: p.min_stock ?? 5,
      category: p.category ?? null,
      barcode: p.barcode ?? null
    }));
  }, [user]);

  // Fetch stock movements
  const fetchMovements = useCallback(async (): Promise<StockMovement[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Enrich with product names
    const productIds = [...new Set(data?.map(m => m.product_id).filter(Boolean))];
    if (productIds.length === 0) return (data || []).map(m => ({ ...m, type: m.type as 'in' | 'out' }));

    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const productsMap = new Map(products?.map(p => [p.id, p]) || []);

    return (data || []).map(m => ({
      ...m,
      type: m.type as 'in' | 'out',
      product: productsMap.get(m.product_id) || null
    }));
  }, [user]);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: fetchProducts,
    enabled: !!user
  });

  const { data: movements = [], isLoading: isLoadingMovements } = useQuery({
    queryKey: ['stockMovements', user?.id],
    queryFn: fetchMovements,
    enabled: !!user
  });

  // Add product
  const addProductMutation = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          price: formData.price,
          stock: formData.stock,
          min_stock: formData.min_stock ?? 5,
          category: formData.category || null,
          barcode: formData.barcode || null,
          active: formData.active ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Produto adicionado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao adicionar produto', description: error.message, variant: 'destructive' });
    }
  });

  // Update product
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...formData }: Partial<ProductFormData> & { id: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          min_stock: formData.min_stock,
          category: formData.category,
          barcode: formData.barcode,
          active: formData.active
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Produto atualizado!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar produto', description: error.message, variant: 'destructive' });
    }
  });

  // Delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Produto removido!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao remover produto', description: error.message, variant: 'destructive' });
    }
  });

  // Add stock movement
  const addMovementMutation = useMutation({
    mutationFn: async (formData: StockMovementFormData) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Create movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          user_id: user.id,
          product_id: formData.product_id,
          type: formData.type,
          quantity: formData.quantity,
          reason: formData.reason || null
        });

      if (movementError) throw movementError;

      // Update product stock
      const product = products.find(p => p.id === formData.product_id);
      if (product) {
        const newStock = formData.type === 'in' 
          ? product.stock + formData.quantity 
          : product.stock - formData.quantity;

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: Math.max(0, newStock) })
          .eq('id', formData.product_id);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      toast({ title: 'Movimentação registrada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao registrar movimentação', description: error.message, variant: 'destructive' });
    }
  });

  // Stats
  const lowStockProducts = products.filter(p => p.stock <= p.min_stock && p.active);
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.active).length,
    lowStockCount: lowStockProducts.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    categories: [...new Set(products.map(p => p.category).filter(Boolean))]
  };

  return {
    products,
    movements,
    lowStockProducts,
    stats,
    isLoading: isLoadingProducts || isLoadingMovements,
    addProduct: addProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    addMovement: addMovementMutation.mutateAsync,
    isAddingProduct: addProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isAddingMovement: addMovementMutation.isPending
  };
};
