// components/TransactionHistoryDialog.tsx
'use client';

import { X, Clock } from 'lucide-react';
import type { Transaction } from '@/services/transactions';

interface TransactionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  isLoading: boolean;
}

export default function TransactionHistoryDialog({
  isOpen,
  onClose,
  transactions,
  isLoading,
}: TransactionHistoryDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="flex items-center text-base font-semibold text-gray-800">
            <Clock size={18} className="mr-2 text-gray-500" />
            Credits History
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              Loading...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Clock size={32} className="mx-auto mb-2 text-gray-300" />
              No transactions found
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, index) => (
                <div
                  key={tx.id ?? `tx-${index}`}
                  className="p-2 bg-gray-50 rounded border text-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {tx.description}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'credit'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}
                      {tx.amount} 🐚
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t">
          <button
            onClick={onClose}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
