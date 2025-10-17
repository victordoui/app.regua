import { Client } from './appointments'; // Reusing Client type
import { Service } from './appointments'; // Reusing Service type

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  service_id: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  product?: Product; // Populated via join
  service?: Service; // Populated via join
}

export interface Sale {
  id: string;
  user_id: string;
  client_id: string | null;
  sale_date: string;
  total_amount: number;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Client; // Populated via join
  sale_items?: SaleItem[]; // Populated via join
}

export interface CurrentSaleItem {
  type: 'product' | 'service';
  id: string; // product_id or service_id
  name: string;
  price: number;
  quantity: number;
  stock?: number; // Only for products
}

export interface SaleFormData {
  client_id: string | null;
  payment_method: string;
  notes: string;
  items: CurrentSaleItem[];
}