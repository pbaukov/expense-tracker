export interface Expense {
  id: string;
  date: string;       // ISO date string YYYY-MM-DD
  amount: number;
  category: string;
  description: string;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Housing',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Travel',
  'Education',
  'Other'
];
