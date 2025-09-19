import { apiClient } from './api';

export interface Transaction {
  transaction_id: string; // transaction_id from backend
  credits: number; // credit change (positive or negative)
  amount: number; // monetary amount in USD
  transaction_type: 'credit' | 'debit';
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
