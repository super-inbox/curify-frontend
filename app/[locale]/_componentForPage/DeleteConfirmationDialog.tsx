// app/[locale]/_componentForPage/DeleteConfirmationDialog.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, AlertCircle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  projectName, 
  isLoading = false 
}: DeleteConfirmationDialogProps) {
  const t = useTranslations('delete');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            {t('message')}
          </p>
          
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <p className="font-medium text-gray-900 truncate">{projectName}</p>
            {isLoading && (
              <div className="flex items-center justify-center mt-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-500">
            {t('warning')}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            disabled={isLoading}
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('deleting')}
              </div>
            ) : (
              t('delete')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}