export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts_transactions: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          type: 'payable' | 'receivable'
          due_date: string
          status: 'pending' | 'paid' | 'overdue' | 'received' | 'cancelled'
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          type: 'payable' | 'receivable'
          due_date: string
          status?: 'pending' | 'paid' | 'overdue' | 'received' | 'cancelled'
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: number
          type?: 'payable' | 'receivable'
          due_date?: string
          status?: 'pending' | 'paid' | 'overdue' | 'received' | 'cancelled'
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          client_id: string
          service_id: string
          barbeiro_id: string | null
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          total_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          service_id: string
          barbeiro_id?: string | null
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          total_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          service_id?: string
          barbeiro_id?: string | null
          appointment_date?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          total_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barbeiro_id_fkey"
            columns: ["barbeiro_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          price: number
          stock: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          price: number
          stock?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          price?: number
          stock?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sales: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          sale_date: string
          total_amount: number
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          sale_date?: string
          total_amount: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          sale_date?: string
          total_amount?: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string | null
          service_id: string | null
          item_name: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id?: string | null
          service_id?: string | null
          item_name: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string | null
          service_id?: string | null
          item_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          billing_cycle: 'monthly' | 'yearly'
          features: string[]
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          billing_cycle: 'monthly' | 'yearly'
          features?: string[]
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          billing_cycle?: 'monthly' | 'yearly'
          features?: string[]
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          client_id: string
          plan_id: string
          status: 'active' | 'cancelled' | 'paused' | 'expired'
          start_date: string
          end_date: string
          credits_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          plan_id: string
          status?: 'active' | 'cancelled' | 'paused' | 'expired'
          start_date: string
          end_date: string
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          plan_id?: string
          status?: 'active' | 'cancelled' | 'paused' | 'expired'
          start_date?: string
          end_date?: string
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      transaction_type: 'payable' | 'receivable'
      transaction_status: 'pending' | 'paid' | 'overdue' | 'received' | 'cancelled'
      billing_cycle_type: 'monthly' | 'yearly'
      subscription_status: 'active' | 'cancelled' | 'paused' | 'expired'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  T extends Record<string, any> = Database['public']['Tables'],
  R extends keyof T = keyof T
> = T[R]

export type TablesInsert<
  T extends Record<string, any> = Database['public']['Tables'],
  R extends keyof T = keyof T
> = T[R]['Insert']

export type TablesUpdate<
  T extends Record<string, any> = Database['public']['Tables'],
  R extends keyof T = keyof T
> = T[R]['Update']

export type TablesRelational<
  T extends Record<string, any> = Database['public']['Tables'],
  R extends keyof T = keyof T
> = T[R]['Row']