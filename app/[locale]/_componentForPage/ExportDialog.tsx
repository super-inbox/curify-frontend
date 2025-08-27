// app/[locale]/project/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import { useParams } from "next/navigation";
import ExportDialog from "./ExportDialog"; // Assuming ExportDialog is in the same directory

interface Segment {
  line_number: number;
  original: string;
  translated: string;
  start: number;
  end: number;
}

export default function ProjectDetailsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { locale } = useParams();

  // Mock files to pass to the ExportDialog
  const mockFiles = [
    { name: "My Project_EN.mp4", type: "MP4", size: "25.4 MB", downloadUrl: "/demo.mp4" },
    { name: "My Project_EN.srt", type: "SRT", size: "12 KB", downloadUrl: "/subtitles.srt" },
  ];

  useEffect(() => {
    fetch("/data/project_segments.json")
      .then((res) => res.json())
      .then((data) => setSegments(data));
  }, []);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Head>
        <title>Project Details | Curify Studio</title>
      </Head>
      <div className="min-h-screen bg-white p-6 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Segment Table */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <Link
                href={`/${locale}/profile`}
                className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Return to Profile
              </Link>
              <div className="space-x-2 ml-auto">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
                <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Regenerate</button>
              </div>
            </div>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Original</th>
                  <th className="p-2 border">Translated</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((seg) => (
                  <tr key={seg.line_number} className="border-t">
                    <td className="p-2 border align-top text-gray-500">{seg.line_number}</td>
                    <td className="p-2 border align-top">{seg.original}</td>
                    <td className="p-2 border align-top text-blue-900">{seg.translated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Video Viewer */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Video Preview</h2>
              <div className="space-x-2">
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">▶ Play</button>
                <button onClick={handleOpenDialog} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">⬇ Export</button>
              </div>
            </div>

            <Tab.Group>
              <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1">
                <Tab
                  className={({ selected }) =>
                    clsx("w-full py-2 text-sm font-medium leading-5 text-blue-700 rounded-lg", {
                      "bg-white shadow": selected,
                    })
                  }
                >
                  Original Video
                </Tab>
                <Tab
                  className={({ selected }) =>
                    clsx("w-full py-2 text-sm font-medium leading-5 text-blue-700 rounded-lg", {
                      "bg-white shadow": selected,
                    })
                  }
                >
                  Translated Video
                </Tab>
              </Tab.List>
              <Tab.Panels className="mt-4">
                <Tab.Panel className="relative aspect-video bg-black flex items-center justify-center">
                  <video src="/demo.mp4" controls className="w-full h-full object-contain" />
                </Tab.Panel>
                <Tab.Panel className="relative aspect-video bg-black flex items-center justify-center">
                  <video src="/demo.mp4" controls className="w-full h-full object-contain" />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
      
      {/* Export Dialog */}
      <ExportDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        files={mockFiles}
      />
    </>
  );
}