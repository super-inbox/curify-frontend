// components/TransactionHistoryDialog.tsx
'use client';

import { Clock } from 'lucide-react';
import type { Transaction } from '@/services/transactions';
import DialogCloseButton from "../_components/button/DialogCloseButton";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("transactionHistory");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center mt-12">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 m-4">
        {/* Close button (top-right) */}
        <DialogCloseButton onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
          <h2 className="flex items-center text-lg font-semibold text-gray-800">
            <Clock size={18} className="mr-2 text-gray-500" />
            {t("title")}
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              {t("loading")}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Clock size={32} className="mx-auto mb-2 text-gray-300" />
              {t("empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 border-b">{t("id")}</th>
                    <th className="px-3 py-2 border-b w-32 whitespace-nowrap">
                      {t("type")}
                    </th>
                    <th className="px-3 py-2 border-b text-right">{t("credits")}</th>
                    <th className="px-3 py-2 border-b w-24 text-right">
                      {t("amount")}
                    </th>
                    <th className="px-3 py-2 border-b">{t("date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx.transaction_id}
                      className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
                    >
                      {/* ID */}
                      <td className="px-3 py-2 border-b text-gray-600 text-xs">
                        {tx.transaction_id ?? "-"}
                      </td>

                      {/* Type */}
                      <td className="px-3 py-2 border-b text-gray-800 text-sm w-32 whitespace-nowrap">
                        {tx.transaction_type ?? "-"}
                      </td>

                      {/* Credits */}
                      <td className="px-3 py-2 border-b text-right font-medium">
                        {tx.credits != null ? (
                          <span
                            className={
                              tx.transaction_type?.toLowerCase().includes("credit")
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {tx.transaction_type?.toLowerCase().includes("credit")
                              ? "+"
                              : "-"}
                            {tx.credits} 🐚
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-2 border-b text-right text-gray-700 w-24 whitespace-nowrap">
                        {tx.amount != null ? `$${tx.amount}` : "-"}
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2 border-b text-gray-500 text-xs">
                        {tx.created_at
                          ? new Date(tx.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
