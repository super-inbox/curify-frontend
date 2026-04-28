"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, RotateCcw, ChevronRight } from "lucide-react";
import CdnImage from "./CdnImage";

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
      { value: "E" as EI, label: "Out with the crowd", img: "/images/nano_insp/template-interior-design-mood-board-generator-living-room.jpg" },
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
      { value: "T" as TF, label: "Logic & clear reasoning", img: "/images/nano_insp/template-interior-design-mood-board-generator-home-office.jpg" },
      { value: "F" as TF, label: "Gut feeling & what's right", img: "/images/nano_insp/template-interior-design-mood-board-generator-dining-bar.jpg" },
    ],
  },
  {
    key: "JP" as const,
    q: "Your ideal Friday night plan?",
    options: [
      { value: "J" as JP, label: "Reserved, researched, ready", img: "/images/nano_insp/template-travel-zh-beijing.jpg" },
      { value: "P" as JP, label: "Wing it & see what happens", img: "/images/nano_insp/template-travel-zh-sanya.jpg" },
    ],
  },
];

// ── MBTI result data ──────────────────────────────────────────────────────────

const MBTI_DATA: Record<string, { tagline: string; img: string }> = {
  INTJ: { tagline: "The Lone Strategist",          img: "/images/nano_insp_preview/template-custom-character-card-intj-solitary-strategist-male-prev.jpg" },
  INTP: { tagline: "The Quiet Architect of Ideas", img: "/images/nano_insp_preview/template-mbti-ghibli-calcifer-prev.jpg" },
  ENTJ: { tagline: "The Unstoppable Commander",    img: "/images/nano_insp_preview/template-mbti-ghibli-yubaba-prev.jpg" },
  ENTP: { tagline: "The Devil's Advocate",         img: "/images/nano_insp_preview/template-mbti-ghibli-catbus-prev.jpg" },
  INFJ: { tagline: "The Visionary Healer",         img: "/images/nano_insp_preview/template-custom-character-card-infj-ethereal-healer-female-prev.jpg" },
  INFP: { tagline: "The Dreamer Who Changes Worlds", img: "/images/nano_insp_preview/template-mbti-ghibli-sophie-prev.jpg" },
  ENFJ: { tagline: "The Magnetic Storyteller",     img: "/images/nano_insp_preview/template-mbti-ghibli-howl-prev.jpg" },
  ENFP: { tagline: "The Sunshine That Won't Stop", img: "/images/nano_insp_preview/template-custom-character-card-enfp-fiery-little-sun-male-prev.jpg" },
  ISTJ: { tagline: "The Unshakeable Rock",         img: "/images/nano_insp_preview/template-mbti-ghibli-jiro-horikoshi-prev.jpg" },
  ISFJ: { tagline: "The Quiet Guardian",           img: "/images/nano_insp_preview/template-mbti-ghibli-chihiro-prev.jpg" },
  ESTJ: { tagline: "The Architect of Order",       img: "/images/nano_insp_preview/template-mbti-ghibli-kiki-prev.jpg" },
  ESFJ: { tagline: "The Warmth Everyone Needs",    img: "/images/nano_insp_preview/template-mbti-ghibli-totoro-prev.jpg" },
  ISTP: { tagline: "The Cool-Headed Maverick",     img: "/images/nano_insp_preview/template-custom-character-card-istp-cool-wild-rose-female-prev.jpg" },
  ISFP: { tagline: "The Secret Artist",            img: "/images/nano_insp_preview/template-mbti-ghibli-marnie-prev.jpg" },
  ESTP: { tagline: "The Thrill-Seeker",            img: "/images/nano_insp_preview/template-mbti-ghibli-porco-rosso-prev.jpg" },
  ESFP: { tagline: "The Life of Every Room",       img: "/images/nano_insp_preview/template-custom-character-card-esfp-radiant-fireworks-female-prev.jpg" },
};

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

function QuizStep({
  step,
  answers,
  onAnswer,
}: {
  step: number;
  answers: Answers;
  onAnswer: (key: keyof Answers, value: string) => void;
}) {
  const q = QUESTIONS[step];

  return (
    <div className="p-6">
      <p className="mb-5 text-center text-lg font-semibold text-neutral-900">{q.q}</p>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const selected = answers[q.key] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer(q.key, opt.value)}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-150 ${
                selected
                  ? "border-purple-500 shadow-md shadow-purple-100"
                  : "border-neutral-200 hover:border-purple-300"
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
              {selected && (
                <div className="absolute inset-0 bg-purple-500/10" />
              )}
              <div className={`px-3 py-2.5 text-sm font-medium transition-colors ${
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

function ResultStep({
  mbti,
  locale,
  onReset,
}: {
  mbti: string;
  locale: string;
  onReset: () => void;
}) {
  const data = MBTI_DATA[mbti] ?? { tagline: "The Unique One", img: "/images/nano_insp_preview/template-mbti-ghibli-totoro-prev.jpg" };

  const ctas = [
    { label: `See ${mbti} in Ghibli`, href: `/${locale}/nano-template/template-mbti-ghibli` },
    { label: "Compare with a friend", href: `/${locale}/nano-template/template-mbti-contrast` },
    { label: "Your MBTI character card", href: `/${locale}/nano-template/template-mbti-generic` },
  ];

  return (
    <div className="p-6">
      <div className="flex gap-5">
        {/* Character image */}
        <div className="shrink-0">
          <div className="h-40 w-32 overflow-hidden rounded-2xl shadow-md">
            <CdnImage
              src={data.img}
              alt={mbti}
              width={128}
              height={160}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Type + tagline */}
        <div className="flex flex-col justify-center gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-500">Your type</p>
          <p className="text-5xl font-black tracking-tight text-neutral-900">{mbti}</p>
          <p className="text-base font-medium text-neutral-600">{data.tagline}</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-5 flex flex-col gap-2">
        {ctas.map((cta) => (
          <Link
            key={cta.href}
            href={cta.href}
            className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:bg-purple-50 hover:text-purple-800"
          >
            {cta.label}
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600"
      >
        <RotateCcw className="h-3 w-3" />
        Retake quiz
      </button>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function MBTIQuizWidget({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const mbti =
    step === QUESTIONS.length
      ? `${answers.EI ?? "I"}${answers.SN ?? "N"}${answers.TF ?? "T"}${answers.JP ?? "J"}`
      : null;

  const handleAnswer = (key: keyof Answers, value: string) => {
    const next = { ...answers, [key]: value } as Answers;
    setAnswers(next);
    setTimeout(() => setStep((s) => s + 1), 260);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    // Desktop only
    <div className="hidden lg:block">
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-transform hover:scale-105 hover:shadow-xl active:scale-100"
        aria-label="Take MBTI personality quiz"
      >
        <Sparkles className="h-4 w-4" />
        What's your MBTI?
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          {/* Panel */}
          <div
            className="relative w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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
