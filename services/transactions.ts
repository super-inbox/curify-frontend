// services/transactions.ts
import { apiClient } from './api';

export interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
  // Add other transaction fields as needed based on your API response
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