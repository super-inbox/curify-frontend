"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../Loading";

interface Segment {
  start: string;
  end: string;
  original: string;
  translated: string;
}

interface TranslationData {
  segments: Segment[];
  originalVideo: string;
  translatedVideo: string;
}

type ProcessState =
  | "Preprocess"
  | "Transcribing"
  | "Translating"
  | "Dubbing";

export default function Magic() {
  const params = useParams();
  const id = params.id;

  const [state, setState] = useState<ProcessState>('Preprocess');
  const [process, setProcess] = useState(0);
  const [data, setData] = useState<TranslationData | null>(null);
  const [tab, setTab] = useState<"Original" | "Translated">("Original");

  // useEffect(() => {
  //   if (!id) return;

  //   let polling = true;

  //   const poll = () => {
  //     fetch(`/data/translations/${id}.json`)
  //       .then((res) => {
  //         if (!res.ok) throw new Error(`Fetch failed`);
  //         return res.json();
  //       })
  //       .then((res) => {
  //         if (res.data) {
  //           setState(null);
  //           setProcess(100);
  //           setData(res.data);
  //           polling = false;
  //         } else {
  //           setState(res.state);
  //           setProcess(res.process);
  //         }
  //         if (polling) {
  //           setTimeout(poll, 2000); // poll every 2 seconds
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("Failed to load translation data:", err);
  //         setTimeout(poll, 5000); // retry after 5 seconds on error
  //       });
  //   };

  //   poll();

  //   return () => {
  //     polling = false;
  //   };
  // }, [id]);

  // for (let i = 0; i <= 4; i += 1) {
  //   setInterval(() => {

  //   }, 3000)
  // }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Loading />
    </div>
  );
}
