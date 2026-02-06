export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      accounts_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          due_date: string
          id: string
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          due_date: string
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          price: number
          service_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          price: number
          service_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          price?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          barbeiro_id: string | null
          client_id: string
          created_at: string
          id: string
          notes: string | null
          parent_appointment_id: string | null
          recurrence_end_date: string | null
          recurrence_type: string | null
          reminder_sent_at: string | null
          result_photo_url: string | null
          service_id: string
          status: string
          total_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          barbeiro_id?: string | null
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          parent_appointment_id?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          reminder_sent_at?: string | null
          result_photo_url?: string | null
          service_id: string
          status?: string
          total_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          barbeiro_id?: string | null
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          parent_appointment_id?: string | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          reminder_sent_at?: string | null
          result_photo_url?: string | null
          service_id?: string
          status?: string
          total_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_parent_appointment_id_fkey"
            columns: ["parent_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      barber_absences: {
        Row: {
          barber_id: string
          created_at: string | null
          end_date: string
          id: string
          notes: string | null
          start_date: string
          type: string | null
          user_id: string
        }
        Insert: {
          barber_id: string
          created_at?: string | null
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          type?: string | null
          user_id: string
        }
        Update: {
          barber_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      barber_shifts: {
        Row: {
          barber_id: string
          break_end: string | null
          break_start: string | null
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_recurring: boolean
          specific_date: string | null
          start_time: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          barber_id: string
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_recurring?: boolean
          specific_date?: string | null
          start_time: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          barber_id?: string
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_recurring?: boolean
          specific_date?: string | null
          start_time?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      barbershop_settings: {
        Row: {
          address: string | null
          allow_guest_booking: boolean | null
          allow_online_cancellation: boolean | null
          banner_url: string | null
          buffer_minutes: number | null
          cancellation_hours_before: number | null
          company_name: string
          created_at: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          is_public_page_enabled: boolean | null
          logo_url: string | null
          noshow_fee_amount: number | null
          noshow_fee_enabled: boolean | null
          onboarding_completed: boolean | null
          phone: string | null
          primary_color_hex: string | null
          secondary_color_hex: string | null
          slogan: string | null
          updated_at: string | null
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          allow_guest_booking?: boolean | null
          allow_online_cancellation?: boolean | null
          banner_url?: string | null
          buffer_minutes?: number | null
          cancellation_hours_before?: number | null
          company_name: string
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_public_page_enabled?: boolean | null
          logo_url?: string | null
          noshow_fee_amount?: number | null
          noshow_fee_enabled?: boolean | null
          onboarding_completed?: boolean | null
          phone?: string | null
          primary_color_hex?: string | null
          secondary_color_hex?: string | null
          slogan?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          allow_guest_booking?: boolean | null
          allow_online_cancellation?: boolean | null
          banner_url?: string | null
          buffer_minutes?: number | null
          cancellation_hours_before?: number | null
          company_name?: string
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_public_page_enabled?: boolean | null
          logo_url?: string | null
          noshow_fee_amount?: number | null
          noshow_fee_enabled?: boolean | null
          onboarding_completed?: boolean | null
          phone?: string | null
          primary_color_hex?: string | null
          secondary_color_hex?: string | null
          slogan?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      bd_ativo: {
        Row: {
          created_at: string
          id: number
          num: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          num?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          num?: number | null
        }
        Relationships: []
      }
      blocked_slots: {
        Row: {
          barber_id: string
          created_at: string | null
          end_datetime: string
          id: string
          reason: string | null
          start_datetime: string
          user_id: string
        }
        Insert: {
          barber_id: string
          created_at?: string | null
          end_datetime: string
          id?: string
          reason?: string | null
          start_datetime: string
          user_id: string
        }
        Update: {
          barber_id?: string
          created_at?: string | null
          end_datetime?: string
          id?: string
          reason?: string | null
          start_datetime?: string
          user_id?: string
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          close_time: string | null
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          open_time: string | null
          user_id: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
          user_id: string
        }
        Update: {
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          address_cep: string | null
          address_city: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          avatar_url: string | null
          barbershop_user_id: string
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_cep?: string | null
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          barbershop_user_id: string
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_cep?: string | null
          address_city?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          avatar_url?: string | null
          barbershop_user_id?: string
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          referral_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          referral_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          referral_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commission_rules: {
        Row: {
          barber_id: string | null
          commission_type: string | null
          commission_value: number
          created_at: string | null
          id: string
          service_id: string | null
          user_id: string
        }
        Insert: {
          barber_id?: string | null
          commission_type?: string | null
          commission_value: number
          created_at?: string | null
          id?: string
          service_id?: string | null
          user_id: string
        }
        Update: {
          barber_id?: string | null
          commission_type?: string | null
          commission_value?: number
          created_at?: string | null
          id?: string
          service_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          appointment_id: string | null
          barber_id: string
          created_at: string | null
          id: string
          paid_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          barber_id: string
          created_at?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          barber_id?: string
          created_at?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          participant_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participant_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          participant_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          min_purchase: number | null
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          min_purchase?: number | null
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          min_purchase?: number | null
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string | null
          id: string
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string
          target_segment: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          target_segment?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          target_segment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorite_barbers: {
        Row: {
          barber_id: string
          barbershop_user_id: string
          client_profile_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          barber_id: string
          barbershop_user_id: string
          client_profile_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          barber_id?: string
          barbershop_user_id?: string
          client_profile_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_barbers_client_profile_id_fkey"
            columns: ["client_profile_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          barber_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          service_id: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          barber_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          service_id?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          barber_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          service_id?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_card_transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          gift_card_id: string
          id: string
          notes: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string
          gift_card_id: string
          id?: string
          notes?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          gift_card_id?: string
          id?: string
          notes?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_card_transactions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          buyer_email: string | null
          buyer_name: string | null
          code: string
          created_at: string
          current_balance: number
          expires_at: string | null
          id: string
          message: string | null
          original_value: number
          recipient_email: string | null
          recipient_name: string | null
          redeemed_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          buyer_email?: string | null
          buyer_name?: string | null
          code: string
          created_at?: string
          current_balance: number
          expires_at?: string | null
          id?: string
          message?: string | null
          original_value: number
          recipient_email?: string | null
          recipient_name?: string | null
          redeemed_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          buyer_email?: string | null
          buyer_name?: string | null
          code?: string
          created_at?: string
          current_balance?: number
          expires_at?: string | null
          id?: string
          message?: string | null
          original_value?: number
          recipient_email?: string | null
          recipient_name?: string | null
          redeemed_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          points: number
          total_earned: number
          total_redeemed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          points_required: number
          reward_type: string
          reward_value: number | null
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          points_required: number
          reward_type: string
          reward_value?: number | null
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          points_required?: number
          reward_type?: string
          reward_value?: number | null
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          appointment_id: string | null
          created_at: string
          description: string | null
          id: string
          loyalty_points_id: string | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          loyalty_points_id?: string | null
          points: number
          type: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          loyalty_points_id?: string | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_loyalty_points_id_fkey"
            columns: ["loyalty_points_id"]
            isOneToOne: false
            referencedRelation: "loyalty_points"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_campaigns: {
        Row: {
          channels: string[]
          click_rate: number | null
          created_at: string | null
          custom_message: string | null
          description: string | null
          failed_count: number | null
          id: string
          name: string
          open_rate: number | null
          recipients_count: number | null
          scheduled_date: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          target_audience: string
          template_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channels?: string[]
          click_rate?: number | null
          created_at?: string | null
          custom_message?: string | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name: string
          open_rate?: number | null
          recipients_count?: number | null
          scheduled_date?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          target_audience: string
          template_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channels?: string[]
          click_rate?: number | null
          created_at?: string | null
          custom_message?: string | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name?: string
          open_rate?: number | null
          recipients_count?: number | null
          scheduled_date?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          target_audience?: string
          template_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          campaign_id: string | null
          channel: string
          client_id: string | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message: string
          metadata: Json | null
          read_at: string | null
          recipient: string
          status: string
          subject: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          channel: string
          client_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read_at?: string | null
          recipient: string
          status?: string
          subject?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          channel?: string
          client_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read_at?: string | null
          recipient?: string
          status?: string
          subject?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "notification_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_address: string | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          push_subscription: Json | null
          reminder_hours_before: number | null
          system_enabled: boolean | null
          updated_at: string | null
          user_id: string
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          email_address?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          push_subscription?: Json | null
          reminder_hours_before?: number | null
          system_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          email_address?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          push_subscription?: Json | null
          reminder_hours_before?: number | null
          system_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          message: string
          name: string
          subject: string | null
          timing_hours: number
          trigger: string
          type: string
          updated_at: string | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          message: string
          name: string
          subject?: string | null
          timing_hours?: number
          trigger: string
          type: string
          updated_at?: string | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          message?: string
          name?: string
          subject?: string | null
          timing_hours?: number
          trigger?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string | null
          id: string
          payment_method: string | null
          pix_code: string | null
          status: string | null
          stripe_payment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          pix_code?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          pix_code?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          super_admin_id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          super_admin_id: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          super_admin_id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      platform_broadcast_messages: {
        Row: {
          channel: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          sent_at: string | null
          sent_count: number | null
          target_plans: string[] | null
          target_status: string[] | null
          title: string
        }
        Insert: {
          channel: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          sent_at?: string | null
          sent_count?: number | null
          target_plans?: string[] | null
          target_status?: string[] | null
          title: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          sent_at?: string | null
          sent_count?: number | null
          target_plans?: string[] | null
          target_status?: string[] | null
          title?: string
        }
        Relationships: []
      }
      platform_coupons: {
        Row: {
          active: boolean | null
          applicable_plans: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          applicable_plans?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          applicable_plans?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      platform_email_templates: {
        Row: {
          active: boolean | null
          body_html: string
          created_at: string | null
          id: string
          name: string
          subject: string
          trigger_event: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          body_html: string
          created_at?: string | null
          id?: string
          name: string
          subject: string
          trigger_event?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          body_html?: string
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          trigger_event?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_url: string | null
          paid_at: string | null
          payment_method: string | null
          status: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "platform_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_plan_config: {
        Row: {
          created_at: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_appointments_month: number
          max_barbers: number
          plan_type: string
          price_monthly: number
          price_yearly: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_appointments_month?: number
          max_barbers?: number
          plan_type: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_appointments_month?: number
          max_barbers?: number
          plan_type?: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          features: Json | null
          id: string
          max_appointments_month: number | null
          max_barbers: number | null
          notes: string | null
          payment_status: string | null
          plan_type: string
          start_date: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          max_appointments_month?: number | null
          max_barbers?: number | null
          notes?: string | null
          payment_status?: string | null
          plan_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          max_appointments_month?: number | null
          max_barbers?: number | null
          notes?: string | null
          payment_status?: string | null
          plan_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_ticket_messages: {
        Row: {
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "platform_support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          active: boolean | null
          barber_id: string | null
          created_at: string | null
          day_of_week: number | null
          end_time: string | null
          id: string
          name: string
          price_modifier_type: string
          price_modifier_value: number
          priority: number | null
          rule_type: string
          service_id: string | null
          start_time: string | null
          updated_at: string | null
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          barber_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          name: string
          price_modifier_type?: string
          price_modifier_value?: number
          priority?: number | null
          rule_type: string
          service_id?: string | null
          start_time?: string | null
          updated_at?: string | null
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          barber_id?: string | null
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          name?: string
          price_modifier_type?: string
          price_modifier_value?: number
          priority?: number | null
          rule_type?: string
          service_id?: string | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pricing_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          barcode: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          min_stock: number | null
          name: string
          price: number
          stock: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          barcode?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock?: number | null
          name: string
          price: number
          stock?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          barcode?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          min_stock?: number | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          specializations: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          specializations?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string
          referred_client_id: string
          referrer_client_id: string
          reward_amount: number | null
          reward_given: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code: string
          referred_client_id: string
          referrer_client_id: string
          reward_amount?: number | null
          reward_given?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_client_id?: string
          referrer_client_id?: string
          reward_amount?: number | null
          reward_given?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_client_id_fkey"
            columns: ["referred_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_client_id_fkey"
            columns: ["referrer_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string | null
          barber_id: string | null
          client_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          barber_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          barber_id?: string | null
          client_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          product_id: string | null
          quantity: number
          sale_id: string
          service_id: string | null
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          product_id?: string | null
          quantity: number
          sale_id: string
          service_id?: string | null
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          product_id?: string | null
          quantity?: number
          sale_id?: string
          service_id?: string | null
          total_price?: number
          unit_price?: number
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
          },
        ]
      }
      sales: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          sale_date: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          sale_date?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          sale_date?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_combo_items: {
        Row: {
          combo_id: string
          created_at: string | null
          id: string
          service_id: string
        }
        Insert: {
          combo_id: string
          created_at?: string | null
          id?: string
          service_id: string
        }
        Update: {
          combo_id?: string
          created_at?: string | null
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_combo_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "service_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_combo_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_combos: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          image_url: string | null
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          image_url?: string | null
          name: string
          price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          reason: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity: number
          reason?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          reason?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          active: boolean
          billing_cycle: Database["public"]["Enums"]["billing_cycle_type"]
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_cycle: Database["public"]["Enums"]["billing_cycle_type"]
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_cycle?: Database["public"]["Enums"]["billing_cycle_type"]
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          barbershop_user_id: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          barbershop_user_id?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          barbershop_user_id?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          client_id: string
          created_at: string
          credits_remaining: number
          end_date: string
          id: string
          plan_id: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          credits_remaining?: number
          end_date: string
          id?: string
          plan_id: string
          start_date: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          credits_remaining?: number
          end_date?: string
          id?: string
          plan_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
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
        ]
      }
      waitlist: {
        Row: {
          barber_id: string | null
          client_id: string | null
          client_name: string
          client_phone: string
          created_at: string
          id: string
          notified_at: string | null
          preferred_date: string | null
          preferred_time_end: string | null
          preferred_time_start: string | null
          service_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          barber_id?: string | null
          client_id?: string | null
          client_name: string
          client_phone: string
          created_at?: string
          id?: string
          notified_at?: string | null
          preferred_date?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          service_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          barber_id?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string
          created_at?: string
          id?: string
          notified_at?: string | null
          preferred_date?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          service_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_dev_profile_if_not_exists: { Args: never; Returns: undefined }
      create_dev_user_and_profile: { Args: never; Returns: undefined }
      create_subscriber_with_subscription: {
        Args: {
          _company_name?: string
          _display_name: string
          _email: string
          _plan_type?: string
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      inserir_3x_e_parar: { Args: never; Returns: undefined }
      is_client_of: {
        Args: { _barbershop_user_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "barbeiro" | "cliente" | "super_admin"
      billing_cycle_type: "monthly" | "yearly"
      subscription_status: "active" | "cancelled" | "paused" | "expired"
      transaction_status:
        | "pending"
        | "paid"
        | "overdue"
        | "received"
        | "cancelled"
      transaction_type: "payable" | "receivable"
      user_role: "admin" | "barbeiro" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "barbeiro", "cliente", "super_admin"],
      billing_cycle_type: ["monthly", "yearly"],
      subscription_status: ["active", "cancelled", "paused", "expired"],
      transaction_status: [
        "pending",
        "paid",
        "overdue",
        "received",
        "cancelled",
      ],
      transaction_type: ["payable", "receivable"],
      user_role: ["admin", "barbeiro", "cliente"],
    },
  },
} as const
