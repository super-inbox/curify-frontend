import { apiClient } from './api';

export interface Transaction {
  id: string; // transaction_id from backend
  credits: number; // credit change (positive or negative)
  amount: number; // monetary amount in USD
  type: 'credit' | 'debit'; // simplified mapping of TransactionType enum
  created_at: string; // timestamp
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page?: number;
  limit?: number;
}

export const transactionService = {
  async getTransactions(): Promise<TransactionsResponse> {
    const res = await apiClient.request<TransactionsResponse>('/transactions', {
      method: 'GET',
    });
    return res;
  }
};
