"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";

interface File {
  name: string;
  type: string;
  size: string;
  downloadUrl: string;
  cost?: number;
}

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
}

export default function ExportDialog({ isOpen, onClose, files }: ExportDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Centering Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
          <div className="w-full max-w-lg pointer-events-auto">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative bg-white rounded-2xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">Export</Dialog.Title>
                  <button
                    type="button"
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* File List */}
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Type Badge */}
                        <span
                          className={clsx(
                            "text-xs font-bold px-2 py-1 rounded text-white",
                            file.type === "MP4" && "bg-blue-600",
                            file.type === "SRT" && "bg-purple-600",
                            file.type !== "MP4" && file.type !== "SRT" && "bg-gray-500"
                          )}
                        >
                          {file.type.toUpperCase()}
                        </span>

                        {/* File Name */}
                        <span className="text-sm text-gray-800">{file.name}</span>

                        {/* Credit Cost (if any) */}
                        {file.cost && (
                          <span className="text-xs font-medium text-gray-800 bg-white border border-gray-300 px-2 py-0.5 rounded shadow-sm">
                            {file.cost} C
                          </span>
                        )}
                      </div>

                      {/* Download Icon */}
                      <a
                        href={file.downloadUrl}
                        download
                        className="flex items-center space-x-1 hover:text-blue-700"
                      >
                        <Image
                          src="/icons/output.svg"
                          alt="Export"
                          width={20}
                          height={20}
                          className="text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-800">Export</span>
                      </a>
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
