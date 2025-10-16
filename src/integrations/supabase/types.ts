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
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
> = T[R]['Row']

export type TablesUpdate<
  T extends Record<string, any> = Database['public']['Tables'],
  R extends keyof T = keyof T
> = T[R]['Row']

export type TablesRelational<
  T extends Record<string, any> = Database['public']['Tables'],
  R extends keyof T = keyof T
> = T[R]['Row']