"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

// Define the types for the props and file objects
interface File {
  name: string;
  type: string;
  size: string;
  downloadUrl: string;
}

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
}

export default function ExportDialog({ isOpen, onClose, files }: ExportDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Export Files
                  </Dialog.Title>
                  <button
                    type="button"
                    className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Select the files you want to export.
                  </p>
                  <ul className="space-y-2">
                    {files.map((file) => (
                      <li key={file.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-400">({file.size}, {file.type})</span>
                        </div>
                        <a
                          href={file.downloadUrl}
                          download
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Done
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
