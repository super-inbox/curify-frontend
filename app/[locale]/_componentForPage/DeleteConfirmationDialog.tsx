'use client';

import { useTranslations } from 'next-intl';

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
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const t = useTranslations('delete');

  if (!isOpen) return null;

  return (
    <div className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg p-4 w-80 shadow-xl">
      <p className="text-gray-800 text-sm mb-4 text-center">
        {t('message')} <span className="font-semibold">{projectName}</span>?
      </p>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-400 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          {t('cancel')}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-red-500 text-red-600 rounded-md text-sm hover:bg-red-50 transition"
        >
          {t('delete')}
        </button>
      </div>
    </div>
  );
}
