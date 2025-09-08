"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import ExportDialog from "../../_componentForPage/ExportDialog";

interface Segment {
  line_number: number;
  original: string;
  translated: string;
  start: number;
  end: number;
}

interface File {
  name: string;
  type: string;
  size: string;
  downloadUrl: string;
}

export default function ProjectDetailsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [exportFiles, setExportFiles] = useState<File[]>([]);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { locale } = useParams();

  useEffect(() => {
    fetch("/data/project_segments.json")
      .then((res) => res.json())
      .then((data) => setSegments(data));

    fetch("/data/export_files.json")
      .then((res) => res.json())
      .then((data) => setExportFiles(data));
  }, []);

  const updateTranslation = (index: number, newText: string) => {
    setSegments((prev) => {
      const updated = [...prev];
      updated[index].translated = newText;
      return updated;
    });
  };

  return (
    <>
      <div className="min-h-screen bg-white p-6 pt-20 flex flex-col">
        {/* Top Left Return Button */}
        <div className="mb-4">
          <Link
            href={`/${locale}/workspace`}
            className="inline-flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            <img src="/icons/arrow_left.svg" alt="Back" className="w-4 h-4" />
            Return to Workspace
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 flex-grow">
          {/* Left Side: Segments */}
          <div className="lg:w-2/3 w-full flex flex-col justify-between">
            <div>
              {/* Language Headers */}
              <div className="grid grid-cols-2 mb-2">
                <div className="bg-[#ede9fe] text-purple-800 font-semibold px-4 py-2 rounded-t-lg">
                  Auto Detect
                </div>
                <div className="bg-[#e0f2fe] text-sky-800 font-semibold px-4 py-2 rounded-t-lg">
                  Chinese
                </div>
              </div>

              {/* Segment Texts */}
              <div className="grid grid-cols-2 gap-y-2 bg-white text-sm">
                {segments.map((seg, i) => (
                  <React.Fragment key={seg.line_number}>
                    <div className="px-4 py-1.5 whitespace-pre-line">
                      {seg.original}
                    </div>
                    <div
                      className="px-4 py-1.5 text-gray-800 whitespace-pre-line border border-transparent hover:border-gray-300 rounded-md focus:outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        updateTranslation(
                          i,
                          e.currentTarget.textContent || ""
                        )
                      }
                    >
                      {seg.translated}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Bottom Left Panel Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Save
              </button>
              <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                Regenerate
              </button>
            </div>
          </div>

          {/* Right Side: Video Preview */}
          <div className="lg:w-1/3 w-full flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4">Video Preview</h2>

              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1">
                  <Tab
                    className={({ selected }) =>
                      clsx(
                        "w-full py-2 text-sm font-medium leading-5 text-blue-700 rounded-lg",
                        { "bg-white shadow": selected }
                      )
                    }
                  >
                    Original Video
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      clsx(
                        "w-full py-2 text-sm font-medium leading-5 text-blue-700 rounded-lg",
                        { "bg-white shadow": selected }
                      )
                    }
                  >
                    Translated Video
                  </Tab>
                </Tab.List>
                <Tab.Panels className="mt-4">
                  <Tab.Panel className="aspect-[16/9] relative bg-black rounded-xl overflow-hidden">
                    <video
                      src="/video/training_en.mp4"
                      controls
                      className="absolute w-full h-full object-contain"
                    />
                  </Tab.Panel>
                  <Tab.Panel className="aspect-[16/9] relative bg-black rounded-xl overflow-hidden">
                    <video
                      src="/video/training_zh.mp4"
                      controls
                      className="absolute w-full h-full object-contain"
                    />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>

            {/* Bottom Right Panel Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setIsExportDialogOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <img src="/icons/output.svg" alt="Export" className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      {isExportDialogOpen && (
        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          files={exportFiles}
        />
      )}
    </>
  );
}
