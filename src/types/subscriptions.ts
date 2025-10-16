export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  client_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlan;
  clients?: any;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface PlanFormData {
  name: string;
  description: string;
  price: string;
  billing_cycle: string;
  features: string[];
  active: boolean;
}

export interface SubscriptionFormData {
  client_id: string;
  plan_id: string;
  start_date: string;
}