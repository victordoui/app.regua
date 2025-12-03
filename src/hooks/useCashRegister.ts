import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Product, Sale, SaleItem, CurrentSaleItem, SaleFormData } from "@/types/cash";
import { Service } from "@/types/appointments"; // Reusing Service type
import { Client } from "@/types/appointments"; // Reusing Client type

export const useCashRegister = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentSaleItems, setCurrentSaleItems] = useState<CurrentSaleItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [saleNotes, setSaleNotes] = useState<string>('');

  // Fetch Products
  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  }, [user]);

  const { data: products, isLoading: isLoadingProducts, error: productsError } = useQuery<Product[], Error>({
    queryKey: ["products", user?.id],
    queryFn: fetchProducts,
    enabled: !!user,
  });

  // Fetch Services
  const fetchServices = useCallback(async (): Promise<Service[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  }, [user]);

  const { data: services, isLoading: isLoadingServices, error: servicesError } = useQuery<Service[], Error>({
    queryKey: ["services", user?.id],
    queryFn: fetchServices,
    enabled: !!user,
  });

  // Fetch Clients
  const fetchClients = useCallback(async (): Promise<Client[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name:display_name, email, phone, created_at")
      .eq("user_id", user.id)
      .order("display_name", { ascending: true });
    if (error) throw error;
    return (data || []).map(d => ({
      ...d,
      name: d.name || 'Cliente'
    })) as Client[];
  }, [user]);

  const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[], Error>({
    queryKey: ["clients", user?.id],
    queryFn: fetchClients,
    enabled: !!user,
  });

  useEffect(() => {
    if (productsError || servicesError || clientsError) {
      toast({
        title: "Erro ao carregar dados",
        description: productsError?.message || servicesError?.message || clientsError?.message,
        variant: "destructive",
      });
    }
  }, [productsError, servicesError, clientsError, toast]);

  const addItemToSale = useCallback((item: Product | Service, type: 'product' | 'service') => {
    setCurrentSaleItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id && i.type === type);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        if (type === 'product' && (item as Product).stock !== undefined && existingItem.quantity >= (item as Product).stock) {
          toast({
            title: "Estoque insuficiente",
            description: `Não há mais ${item.name} em estoque.`,
            variant: "destructive",
          });
          return prevItems;
        }
        updatedItems[existingItemIndex] = { ...existingItem, quantity: existingItem.quantity + 1 };
        return updatedItems;
      } else {
        return [...prevItems, {
          type,
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          stock: type === 'product' ? (item as Product).stock : undefined,
        }];
      }
    });
  }, [toast]);

  const updateItemQuantity = useCallback((itemId: string, type: 'product' | 'service', newQuantity: number) => {
    setCurrentSaleItems(prevItems => {
      const itemIndex = prevItems.findIndex(i => i.id === itemId && i.type === type);
      if (itemIndex > -1) {
        const updatedItems = [...prevItems];
        const itemToUpdate = updatedItems[itemIndex];

        if (newQuantity <= 0) {
          return prevItems.filter(i => !(i.id === itemId && i.type === type));
        }

        if (itemToUpdate.type === 'product' && itemToUpdate.stock !== undefined && newQuantity > itemToUpdate.stock) {
          toast({
            title: "Estoque insuficiente",
            description: `A quantidade máxima para ${itemToUpdate.name} é ${itemToUpdate.stock}.`,
            variant: "destructive",
          });
          return prevItems;
        }

        updatedItems[itemIndex] = { ...itemToUpdate, quantity: newQuantity };
        return updatedItems;
      }
      return prevItems;
    });
  }, [toast]);

  const removeItemFromSale = useCallback((itemId: string, type: 'product' | 'service') => {
    setCurrentSaleItems(prevItems => prevItems.filter(item => !(item.id === itemId && item.type === type)));
  }, []);

  const totalAmount = useMemo(() => {
    return currentSaleItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [currentSaleItems]);

  const processSaleMutation = useMutation<Sale, Error, SaleFormData>({
    mutationFn: async (formData) => {
      if (!user) throw new Error("Usuário não autenticado.");
      if (formData.items.length === 0) throw new Error("Adicione itens à venda.");

      // 1. Create Sale
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert({
          user_id: user.id,
          client_id: formData.client_id,
          total_amount: totalAmount,
          payment_method: formData.payment_method,
          notes: formData.notes,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Create Sale Items and update product stock
      const saleItemsToInsert = formData.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.type === 'product' ? item.id : null,
        service_id: item.type === 'service' ? item.id : null,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: saleItemsError } = await supabase
        .from("sale_items")
        .insert(saleItemsToInsert);

      if (saleItemsError) throw saleItemsError;

      // 3. Update Product Stock (only for products)
      for (const item of formData.items) {
        if (item.type === 'product') {
          const product = products?.find(p => p.id === item.id);
          if (product) {
            const newStock = product.stock - item.quantity;
            const { error: stockUpdateError } = await supabase
              .from("products")
              .update({ stock: newStock })
              .eq("id", item.id)
              .eq("user_id", user.id);
            if (stockUpdateError) throw stockUpdateError;
          }
        }
      }

      return saleData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", user?.id] }); // Invalidate products to reflect stock changes
      queryClient.invalidateQueries({ queryKey: ["sales", user?.id] }); // Invalidate sales to show new sale
      toast({ title: "Venda processada com sucesso!" });
      setCurrentSaleItems([]); // Clear current sale
      setSelectedClient(null);
      setPaymentMethod('cash');
      setSaleNotes('');
    },
    onError: (err) => {
      toast({
        title: "Erro ao processar venda",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const processSale = useCallback(async () => {
    const formData: SaleFormData = {
      client_id: selectedClient?.id || null,
      payment_method: paymentMethod,
      notes: saleNotes,
      items: currentSaleItems,
    };
    await processSaleMutation.mutateAsync(formData);
  }, [selectedClient, paymentMethod, saleNotes, currentSaleItems, processSaleMutation]);

  return {
    products: products || [],
    services: services || [],
    clients: clients || [],
    isLoadingProducts,
    isLoadingServices,
    isLoadingClients,
    currentSaleItems,
    addItemToSale,
    updateItemQuantity,
    removeItemFromSale,
    totalAmount,
    selectedClient,
    setSelectedClient,
    paymentMethod,
    setPaymentMethod,
    saleNotes,
    setSaleNotes,
    processSale,
    isProcessingSale: processSaleMutation.isPending,
  };
};