// app/[locale]/_componentForPage/ExportDialog.tsx

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Download } from 'lucide-react';

interface ExportFile {
  name: string;
  type: 'MP4' | 'SRT';
  size?: string;
  downloadUrl: string;
}

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: ExportFile[];
  projectName?: string;
}

export default function ExportDialog({ isOpen, onClose, files, projectName }: ExportDialogProps) {
  const t = useTranslations('export');
  
  if (!isOpen) return null;

  const handleDownload = (file: ExportFile) => {
    const link = document.createElement('a');
    link.href = file.downloadUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileTypeColor = (type: string) => {
    return type === 'MP4' ? 'bg-blue-600' : 'bg-purple-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`${getFileTypeColor(file.type)} text-white px-2 py-1 rounded text-xs font-medium`}>
                  {file.type}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                    {file.name}
                  </p>
                  {file.size && (
                    <p className="text-xs text-gray-500">{file.size}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDownload(file)}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <Download size={14} />
                <span>{t('export')}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}