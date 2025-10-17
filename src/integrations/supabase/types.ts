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