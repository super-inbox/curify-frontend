"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Image from "next/image";
import { File } from "@/types/projects";
import { useTranslations } from "next-intl";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
}

export default function ExportDialog({ isOpen, onClose, files }: ExportDialogProps) {
  const t = useTranslations("export");

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Centering Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none bg-black/20">
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
              <Dialog.Panel className="relative rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    {t("title")}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* File List */}
                <div className="px-6 py-4 bg-gray-100 space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-white shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
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
                        <span className="text-sm text-gray-800">{file.name}</span>
                        {file.cost && (
                          <span className="text-xs font-medium text-gray-800 bg-white border border-gray-300 px-2 py-0.5 rounded shadow-sm">
                            {file.cost} C
                          </span>
                        )}
                      </div>

                      <a
                        href={file.downloadUrl}
                        download
                        className="flex items-center space-x-1 hover:text-blue-700"
                      >
                        <Image
                          src="/icons/output.svg"
                          alt={t("export")}
                          width={20}
                          height={20}
                        />
                        <span className="text-sm font-medium text-gray-800">{t("export")}</span>
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
