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