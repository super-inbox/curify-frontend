"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Sparkles, RotateCcw, Lock } from "lucide-react";
import { useAtom } from "jotai";
import CdnImage from "./CdnImage";
import ShareButton from "./ShareButton";
import MBTIPosterShare from "./MBTIPosterShare";
import { userAtom, drawerAtom, mbtiQuizOpenAtom } from "@/app/atoms/atoms";
import { MBTI_META, IP_COLORS, MBTI_TYPES } from "@/lib/mbti-meta";
import type { MBTIType } from "@/lib/mbti-meta";
import mbtiCharacters from "@/public/data/mbti_characters.json";
import { useTracking } from "@/services/useTracking";

// ── Types ─────────────────────────────────────────────────────────────────────

type EI = "E" | "I";
type SN = "S" | "N";
type TF = "T" | "F";
type JP = "J" | "P";
type Answers = { EI?: EI; SN?: SN; TF?: TF; JP?: JP };

// ── Quiz questions ────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    key: "EI" as const,
    q: "Where do you feel most alive?",
    options: [
      { value: "E" as EI, label: "Out with the crowd", img: "/images/nano_insp/template-group-vocab-category-animals.jpg" },
      { value: "I" as EI, label: "Alone in my own world", img: "/images/nano_insp/template-interior-design-mood-board-generator-bedroom.jpg" },
    ],
  },
  {
    key: "SN" as const,
    q: "What excites you on a new trip?",
    options: [
      { value: "S" as SN, label: "Discovering real local flavors", img: "/images/nano_insp/template-food-zh-italian-pasta.jpg" },
      { value: "N" as SN, label: "The thrill of the unknown", img: "/images/nano_insp/template-travel-zh-xishuangbanna.jpg" },
    ],
  },
  {
    key: "TF" as const,
    q: "What guides your toughest calls?",
    options: [
      { value: "T" as TF, label: "Logic & clear reasoning", img: "/images/nano_insp/template-figure-principles-infographic-albert-einstein.jpg" },
      { value: "F" as TF, label: "Gut feeling & what's right", img: "/images/nano_insp/template-fashion-before-after-outfit-annotation-card-emerald-jewelry.jpg" },
    ],
  },
  {
    key: "JP" as const,
    q: "Your ideal Friday night plan?",
    options: [
      { value: "J" as JP, label: "Reserved, researched, ready", img: "/images/nano_insp/template-travel-zh-beijing.jpg" },
      { value: "P" as JP, label: "Wing it & see what happens", img: "/images/nano_insp/template-mbti-animal-zh-cafe.jpg" },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="h-1 w-full rounded-full bg-neutral-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-purple-500 transition-all duration-400"
        style={{ width: `${(step / total) * 100}%` }}
      />
    </div>
  );
}

function QuizStep({ step, answers, onAnswer }: {
  step: number; answers: Answers; onAnswer: (key: keyof Answers, value: string) => void;
}) {
  const q = QUESTIONS[step];
  return (
    <div className="p-6">
      <p className="mb-5 text-center text-xl font-semibold text-neutral-900">{q.q}</p>
      <div className="grid grid-cols-2 gap-4">
        {q.options.map((opt) => {
          const selected = answers[q.key] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer(q.key, opt.value)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-150 ${
                selected ? "border-purple-500 shadow-md shadow-purple-100" : "border-neutral-200 hover:border-purple-300"
              }`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <CdnImage
                  src={opt.img}
                  alt={opt.label}
                  width={300}
                  height={225}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>
              {selected && <div className="absolute inset-0 bg-purple-500/10" />}
              <div className={`px-3 py-3 text-base font-medium transition-colors ${
                selected ? "bg-purple-50 text-purple-700" : "bg-white text-neutral-700"
              }`}>
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultStep({ mbti, locale, onReset }: { mbti: MBTIType; locale: string; onReset: () => void }) {
  const [user] = useAtom(userAtom);
  const [, setDrawer] = useAtom(drawerAtom);
  const { track } = useTracking();

  const meta = MBTI_META[mbti];
  const chars = (mbtiCharacters as Record<string, typeof mbtiCharacters.INTJ>)[mbti] ?? [];
  const shown = chars.slice(0, 3);
  const ips = [...new Set(chars.map((c) => c.ip))].slice(0, 4);

  const shareUrl = `/${locale}/personality/${mbti}`;

  const handleGenerate = (slug: string) => {
    track({ contentId: mbti, contentType: "mbti_quiz", actionType: "generate" });
    if (!user) { setDrawer("signin"); return; }
    window.open(`/${locale}/nano-template/${slug}`, "_blank");
  };

  return (
    <div className="p-6">
      {/* Type + tagline */}
      <div className="mb-5 flex items-end gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-0.5">Your personality type</p>
          <p className="text-5xl font-black tracking-tight text-neutral-900 leading-none">{mbti}</p>
        </div>
        <p className="mb-1 text-base font-medium text-neutral-500 leading-snug">{meta.tagline}</p>
      </div>

      {/* Character gallery */}
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">Your type across universes</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {shown.map((char) => (
          <div key={char.name} className="relative overflow-hidden rounded-xl">
            <div className="aspect-[3/4] w-full overflow-hidden bg-neutral-100">
              <CdnImage src={char.img} alt={char.name} width={140} height={186} className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
              <p className="text-xs font-bold text-white leading-tight">{char.name}</p>
              <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold mt-0.5 ${IP_COLORS[char.ip] ?? "bg-neutral-100 text-neutral-600"}`}>
                {char.ip}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Generate CTA */}
      <div className="mb-3 rounded-xl border border-dashed border-purple-200 bg-purple-50 p-3">
        <p className="mb-2 text-xs font-semibold text-purple-700">
          {user ? `Generate your ${mbti} card in any universe →` : `Unlock your ${mbti} character card →`}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ips.map((ip) => {
            const char = chars.find((c) => c.ip === ip)!;
            return (
              <button
                key={ip}
                type="button"
                onClick={() => handleGenerate(char.templateSlug)}
                className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 shadow-sm border border-neutral-200 hover:border-purple-300 hover:text-purple-700 transition-colors"
              >
                {!user && <Lock className="h-2.5 w-2.5 text-neutral-400" />}
                {ip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Viral poster */}
      <div className="mb-3">
        <MBTIPosterShare mbti={mbti} locale={locale} />
      </div>

      {/* Share + retake */}
      <div className="flex items-center justify-between">
        <ShareButton
          url={shareUrl}
          title={`I'm ${mbti} — ${meta.tagline}`}
          onShared={() => track({ contentId: mbti, contentType: "mbti_quiz", actionType: "share" })}
        />
        <button
          type="button"
          onClick={onReset}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Retake
        </button>
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function MBTIQuizWidget({ locale }: { locale: string }) {
  const [open, setOpen] = useAtom(mbtiQuizOpenAtom);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [buttonVisible, setButtonVisible] = useState(true);
  const { track } = useTracking();

  // Hide floating button after 1 minute
  useEffect(() => {
    const t = setTimeout(() => setButtonVisible(false), 60_000);
    return () => clearTimeout(t);
  }, []);

  // Read ?personality=TYPE from URL on mount — kept for backwards-compat
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("personality")?.toUpperCase() as MBTIType | undefined;
    if (p && MBTI_META[p]) {
      setAnswers({ EI: p[0] as EI, SN: p[1] as SN, TF: p[2] as TF, JP: p[3] as JP });
      setStep(QUESTIONS.length);
      setOpen(true);
    }
  }, [setOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const mbti = step === QUESTIONS.length
    ? (`${answers.EI ?? "I"}${answers.SN ?? "N"}${answers.TF ?? "T"}${answers.JP ?? "J"}` as MBTIType)
    : null;

  const handleAnswer = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => setStep((s) => s + 1), 260);
  };

  const reset = useCallback(() => {
    setStep(0);
    setAnswers({});
  }, []);

  const handleClose = useCallback(() => { setOpen(false); reset(); }, [setOpen, reset]);

  return (
    <div className="hidden lg:block">
      {buttonVisible && !open && (
        <button
          type="button"
          onClick={() => { setOpen(true); track({ contentId: "widget", contentType: "mbti_quiz", actionType: "click" }); }}
          className="fixed bottom-6 right-6 z-40 flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-transform hover:scale-105 hover:shadow-xl active:scale-100"
          aria-label="Take MBTI personality quiz"
        >
          <Sparkles className="h-4 w-4" />
          What's your MBTI?
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative w-[620px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-500">Visual Personality Test</p>
                <p className="text-lg font-bold text-neutral-900">
                  {mbti ? "Your result" : `Question ${step + 1} of ${QUESTIONS.length}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!mbti && (
              <div className="px-6 pb-2">
                <ProgressBar step={step} total={QUESTIONS.length} />
              </div>
            )}

            {mbti ? (
              <ResultStep mbti={mbti} locale={locale} onReset={reset} />
            ) : (
              <QuizStep step={step} answers={answers} onAnswer={handleAnswer} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
