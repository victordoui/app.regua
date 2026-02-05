// Types for Super Admin functionality

export type PlanType = 'trial' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'expired';

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
  | 'delete_coupon';

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

export interface SubscriberFilters {
  status?: SubscriptionStatus;
  plan?: PlanType;
  search?: string;
}
