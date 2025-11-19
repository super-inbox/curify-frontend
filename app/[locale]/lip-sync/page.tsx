"use client";

import { useState } from "react";


export default function LipSyncDemoPage() {
  const [image, setImage] = useState(null);
  const [song, setSong] = useState("");

  const songs = {
    Chinese: ["Song CN 1", "Song CN 2", "Song CN 3"],
    Cantonese: ["Song HK 1", "Song HK 2", "Song HK 3"],
    English: ["Song EN 1", "Song EN 2", "Song EN 3"],
    Spanish: ["Song ES 1", "Song ES 2", "Song ES 3"],
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
        Lip Sync Demo – Try It Free
      </h1>

      <p className="text-lg text-gray-600 max-w-xl text-center mb-10">
        Upload a photo and pick a 20‑second music clip. We'll generate a singing video with perfect lip sync.
      </p>

      {/* Upload box */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl mb-10">
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Upload your image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
          className="border border-gray-300 p-3 rounded-lg w-full"
        />

        {image && (
          <img
            src={image}
            className="mt-4 rounded-xl shadow-md max-h-64 object-cover mx-auto"
          />
        )}

        <div className="mt-8">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Choose a song clip
          </label>

          {Object.entries(songs).map(([lang, list]) => (
            <div key={lang} className="mb-4">
              <h3 className="text-gray-800 font-semibold mb-2">{lang}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {list.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSong(s)}
                    className={`p-3 rounded-xl border text-sm shadow-sm hover:shadow-md transition-all duration-150 ${
                      song === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-gray-300 text-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          disabled={!image || !song}
          className={`mt-8 w-full py-4 rounded-xl text-lg font-semibold shadow-md transition-all duration-200 ${
            image && song
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Generate Lip Sync Video
        </button>
      </div>

      <footer className="text-gray-500 text-sm mt-10">
        Powered by Curify • Multilingual AI Video Engine
      </footer>
    </div>
  );
}
