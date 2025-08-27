"use client";

import { useAtom } from "jotai";
import { headerAtom, modalAtom } from "@/app/atoms/atoms";

import Modal from "../_components/Modal";
import Upload from "../_components/Upload";
import { useEffect, useState } from "react";
import Options from "../_components/Options";
import Dropdown from "../_components/Selector";
import Switcher from "../_components/Switcher";
import Icon from "../_components/Icon";
import BtnP from "../_components/button/ButtonPrimary";
import { useRouter } from "@/i18n/navigation";

type SpeakerAmount = "Auto" | "1" | "2" | "3" | "4" | "5+";

export default function CreateNewModal() {
  const router = useRouter();

  const [modalState, setModalState] = useAtom(modalAtom);
  const [, setHeaderState] = useAtom(headerAtom);

  const [video, setVideo] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [cost, setCost] = useState(0);

  const defaultSource = "Auto Detect";
  const [source, setSource] = useState(defaultSource);
  const defaultTrans = "Select Language";
  const [transto, setTransto] = useState(defaultTrans);
  const [audio, setAudio] = useState<"Original" | "AI-Generated">("Original");
  const [speaker, setSpeaker] = useState<SpeakerAmount>("Auto");
  const [subtitle, setSubtitle] = useState(false);

  useEffect(() => {
    if (!video) {
      setUrl("");
      return;
    }

    const url = URL.createObjectURL(video);
    setUrl(url);
    setModalState("setting");

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [setModalState, video]);

  const getDuration = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const seconds = e.currentTarget.duration;
    const minutes = Math.floor(seconds / 60);
    setCost(Math.ceil((seconds / 60) * 10));
    const secs = Math.floor(seconds % 60);
    setDuration(
      `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    );
  };

  return (
    <>
      <Modal title="Generate Translated Video" open={modalState === "add"}>
        <Upload onFileSelect={setVideo} />
      </Modal>
      <Modal title="Generate Translated Video" open={modalState === "setting"}>
        <div className="flex flex-col items-center">
          {/* video */}
          <div className="w-80 h-48 bg-[var(--c1)]/20 rounded-2xl overflow-hidden relative mt-5 mb-6">
            {url && (
              <video
                src={url}
                className="w-full h-full object-contain"
                onLoadedMetadata={getDuration}
              />
            )}
            <div
              className={`
                absolute w-full h-9 bottom-0 z-1 flex items-center justify-end pr-3
                bg-[linear-gradient(0deg,rgba(var(--c1-rgb),0.3),rgba(var(--c1-rgb),0))]
                text-white
              `}
            >
              {duration}
            </div>
          </div>

          {/* operation board */}
          <div className="flex flex-col items-center gap-4.5">
            <div className="flex gap-3">
              <div className="flex-1">
                <Dropdown
                  label="Source Language"
                  options={[defaultSource, "1", "2"]}
                  value={source}
                  onChange={setSource}
                />
              </div>
              <div className="flex-1">
                <Dropdown
                  label="Translate To"
                  options={[defaultTrans, "1", "2"]}
                  value={transto}
                  onChange={setTransto}
                />
              </div>
            </div>

            <Options
              label="Audio"
              options={["Original", "AI-Generated"]}
              value={audio}
              onChange={setAudio}
            />

            <Options
              label="Number of Speakers"
              options={["Auto", "1", "2", "3", "4", "5+"]}
              value={speaker}
              onChange={setSpeaker}
            />

            <Switcher
              label="Subtitles"
              checked={subtitle}
              onChange={setSubtitle}
            />
          </div>

          <p className="flex items-center mt-6.5 mb-2">
            Credits Required:
            <span className="text-[var(--p-blue)] ml-1">{cost}</span>
            <button className="p-2.5 mr-[-0.625rem]">
              <Icon name="info" />
            </button>
          </p>

          <BtnP
            onClick={() => {
              setModalState(null)
              setHeaderState((video?.name || '').replace(/\.(mp4|mov|webm|avi|wmv)$/i, ''));
              router.replace("/magic/a1b2c3d4");
            }}
          >
            Start
          </BtnP>
        </div>
      </Modal>
    </>
  );
}
