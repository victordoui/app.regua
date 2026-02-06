// Types for Super Admin functionality

export type PlanType = 'trial' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface PlatformSubscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string | null;
  max_barbers: number;
  max_appointments_month: number;
  features: Record<string, boolean>;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  barbershop_settings?: {
    company_name: string;
    logo_url: string | null;
  };
}

export interface PlatformPayment {
  id: string;
  subscription_id: string | null;
  user_id: string;
  amount: number;
  payment_method: string | null;
  status: PaymentStatus;
  invoice_url: string | null;
  paid_at: string | null;
  created_at: string;
  // Joined data
  subscription?: PlatformSubscription;
  profiles?: {
    display_name: string | null;
    email: string | null;
  };
}

export interface PlatformCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  applicable_plans: PlanType[];
  active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  channel: 'email' | 'push' | 'sms';
  target_plans: PlanType[] | null;
  target_status: SubscriptionStatus[] | null;
  sent_count: number;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  trigger_event: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanConfig {
  id: string;
  plan_type: PlanType;
  display_name: string;
  price_monthly: number;
  price_yearly: number | null;
  max_barbers: number;
  max_appointments_month: number;
  features: Record<string, boolean>;
  is_active: boolean;
  sort_order: number;
  trial_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    display_name: string | null;
    email: string | null;
  };
  barbershop_settings?: {
    company_name: string;
  };
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  // Joined data
  sender?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface AuditLog {
  id: string;
  super_admin_id: string;
  action: AuditAction;
  target_user_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  // Joined data
  target_user?: {
    display_name: string | null;
    email: string | null;
  };
}

export type AuditAction = 
  | 'ban_user'
  | 'unban_user'
  | 'suspend_subscription'
  | 'activate_subscription'
  | 'cancel_subscription'
  | 'renew_subscription'
  | 'change_plan'
  | 'delete_user'
  | 'create_coupon'
  | 'update_coupon'
  | 'delete_coupon'
  | 'send_broadcast'
  | 'create_template'
  | 'update_template'
  | 'delete_template'
  | 'update_plan_config'
  | 'resolve_ticket'
  | 'assign_ticket';

export interface SubscriptionStats {
  total_subscribers: number;
  active_subscribers: number;
  trial_subscribers: number;
  suspended_subscribers: number;
  cancelled_subscribers: number;
  monthly_revenue: number;
  new_this_month: number;
  churn_rate: number;
  by_plan: {
    trial: number;
    basic: number;
    pro: number;
    enterprise: number;
  };
}

export interface PaymentStats {
  mrr: number;
  mrr_growth: number;
  total_revenue: number;
  pending_payments: number;
  failed_payments: number;
  average_ticket: number;
  ltv: number;
}

export interface CouponFormData {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  applicable_plans: PlanType[];
  active: boolean;
}

export interface BroadcastFormData {
  title: string;
  content: string;
  channel: 'email' | 'push' | 'sms';
  target_plans: PlanType[] | null;
  target_status: SubscriptionStatus[] | null;
}

export interface EmailTemplateFormData {
  name: string;
  subject: string;
  body_html: string;
  trigger_event: string | null;
  active: boolean;
}

export interface PlanConfigFormData {
  display_name: string;
  price_monthly: number;
  price_yearly: number | null;
  max_barbers: number;
  max_appointments_month: number;
  features: Record<string, boolean>;
  is_active: boolean;
  trial_days?: number | null;
}

export interface SubscriberFilters {
  status?: SubscriptionStatus;
  plan?: PlanType;
  search?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
}
