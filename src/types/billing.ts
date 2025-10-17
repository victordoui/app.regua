export type TransactionType = 'payable' | 'receivable';
export type TransactionStatus = 'pending' | 'paid' | 'overdue' | 'received' | 'cancelled';

export interface AccountTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  due_date: string; // ISO date string 'YYYY-MM-DD'
  status: TransactionStatus;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountTransactionFormData {
  description: string;
  amount: string; // String para input de formulário
  type: TransactionType;
  due_date: string; // ISO date string 'YYYY-MM-DD'
  category: string;
}