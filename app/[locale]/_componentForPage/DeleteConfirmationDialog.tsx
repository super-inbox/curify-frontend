'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { projectService } from '@/services/projects';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  projectId,
}: DeleteConfirmationDialogProps) {
  const t = useTranslations('delete');
  const router = useRouter();
  const { locale } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await projectService.deleteProject(projectId);

      // Close dialog before navigating
      onClose();

      // Redirect to workspace after successful deletion
      router.push(`/${locale}/workspace`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg p-4 w-80 shadow-xl">
      <p className="text-gray-800 text-sm mb-4 text-center">{t('message')}</p>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-400 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('cancel')}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-red-500 text-red-600 rounded-md text-sm hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('deleting', { defaultMessage: 'Deleting...' }) : t('delete')}
        </button>
      </div>
    </div>
  );
}
