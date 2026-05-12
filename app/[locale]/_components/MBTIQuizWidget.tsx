"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Sparkles, RotateCcw, Lock } from "lucide-react";
import { useAtom } from "jotai";
import CdnImage from "./CdnImage";
import ShareButton from "./ShareButton";
import MBTIPosterShare from "./MBTIPosterShare";
import { userAtom, drawerAtom, mbtiQuizOpenAtom } from "@/app/atoms/atoms";
import { MBTI_META, IP_COLORS, MBTI_TYPES, getMbtiMeta, pickLang } from "@/lib/mbti-meta";
import type { MBTIType, Localized, QuizLang } from "@/lib/mbti-meta";
import mbtiCharacters from "@/public/data/mbti_characters.json";
import { useTracking } from "@/services/useTracking";

// ── Types ─────────────────────────────────────────────────────────────────────

type EI = "E" | "I";
type SN = "S" | "N";
type TF = "T" | "F";
type JP = "J" | "P";
type Answers = { EI?: EI; SN?: SN; TF?: TF; JP?: JP };

// ── Quiz questions ────────────────────────────────────────────────────────────

type QuestionDef = {
  key: "EI" | "SN" | "TF" | "JP";
  q: Localized;
  options: Array<{ value: string; label: Localized; img: string }>;
};

const QUESTIONS: QuestionDef[] = [
  {
    key: "EI",
    q: {
      en: "Where do you feel most alive?",
      zh: "你在哪里最有活力？",
      es: "¿Dónde te sientes más vivo?",
    },
    options: [
      {
        value: "E",
        label: { en: "Out with the crowd", zh: "和大伙儿一起热闹", es: "Saliendo con la multitud" },
        img: "/images/nano_insp_preview/template-group-vocab-category-animals-prev.jpg",
      },
      {
        value: "I",
        label: { en: "Alone in my own world", zh: "独自待在自己的世界", es: "A solas en mi propio mundo" },
        img: "/images/nano_insp_preview/template-interior-design-mood-board-generator-bedroom-prev.jpg",
      },
    ],
  },
  {
    key: "SN",
    q: {
      en: "What excites you on a new trip?",
      zh: "出门旅行，最让你期待的是什么？",
      es: "¿Qué te emociona en un viaje nuevo?",
    },
    options: [
      {
        value: "S",
        label: { en: "Discovering real local flavors", zh: "寻找地道的当地风味", es: "Descubrir sabores locales auténticos" },
        img: "/images/nano_insp_preview/template-food-en-paella-prev.jpg",
      },
      {
        value: "N",
        label: { en: "The thrill of the unknown", zh: "探索未知的刺激", es: "La emoción de lo desconocido" },
        img: "/images/nano_insp_preview/template-travel-italy-amalfi-coast-italy-prev.jpg",
      },
    ],
  },
  {
    key: "TF",
    q: {
      en: "What guides your toughest calls?",
      zh: "做艰难决定时，你靠什么指引？",
      es: "¿Qué te guía en tus decisiones más difíciles?",
    },
    options: [
      {
        value: "T",
        label: { en: "Logic & clear reasoning", zh: "逻辑与清晰的推理", es: "Lógica y razonamiento claro" },
        img: "/images/nano_insp_preview/template-figure-principles-infographic-albert-einstein-prev.jpg",
      },
      {
        value: "F",
        label: { en: "Gut feeling & what's right", zh: "直觉与内心的正义", es: "La intuición y lo que es correcto" },
        img: "/images/nano_insp_preview/template-fashion-before-after-outfit-annotation-card-emerald-jewelry-prev.jpg",
      },
    ],
  },
  {
    key: "JP",
    q: {
      en: "Your ideal Friday night plan?",
      zh: "你理想的周五夜晚是什么样的？",
      es: "¿Cuál es tu plan ideal para un viernes por la noche?",
    },
    options: [
      {
        value: "J",
        label: { en: "Reserved, researched, ready", zh: "预定好、研究好、准备好", es: "Reservado, investigado, listo" },
        img: "/images/nano_insp_preview/template-personal-journey-wolf-path-illustration-dreams-prev.jpg",
      },
      {
        value: "P",
        label: { en: "Wing it & see what happens", zh: "随心而动，看会发生什么", es: "Improvisar y ver qué pasa" },
        img: "/images/nano_insp_preview/template-mbti-animal-zh-cafe-prev.jpg",
      },
    ],
  },
];

// Widget-only chrome strings (not in MBTI_UI since they're widget-specific).
// Use {n}/{total}/{type} placeholders — replaced at render time.
const CHROME: Record<
  "buttonCTA" | "questionOf" | "yourType" | "typeAcrossUniverses" | "generateCard" | "unlockCard" | "retake",
  Localized
> = {
  buttonCTA: {
    en: "What's your MBTI?",
    zh: "你的 MBTI 是什么？",
    es: "¿Cuál es tu MBTI?",
  },
  questionOf: {
    en: "Question {n} of {total}",
    zh: "第 {n} 题 / 共 {total} 题",
    es: "Pregunta {n} de {total}",
  },
  yourType: {
    en: "Your personality type",
    zh: "你的人格类型",
    es: "Tu tipo de personalidad",
  },
  typeAcrossUniverses: {
    en: "Your type across universes",
    zh: "你在不同宇宙中的形象",
    es: "Tu tipo en distintos universos",
  },
  generateCard: {
    en: "Generate your {type} card in any universe →",
    zh: "在任意宇宙中生成你的 {type} 卡片 →",
    es: "Genera tu tarjeta {type} en cualquier universo →",
  },
  unlockCard: {
    en: "Unlock your {type} character card →",
    zh: "解锁你的 {type} 角色卡片 →",
    es: "Desbloquea tu tarjeta de personaje {type} →",
  },
  retake: {
    en: "Retake",
    zh: "重新测试",
    es: "Volver a hacer",
  },
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

function QuizStep({ step, answers, onAnswer, lang }: {
  step: number; answers: Answers; onAnswer: (key: keyof Answers, value: string) => void; lang: QuizLang;
}) {
  const q = QUESTIONS[step];
  return (
    <div className="px-6 pb-6 pt-4">
      <p className="mb-5 text-center text-2xl font-bold text-neutral-900">{q.q[lang]}</p>
      <div className="grid grid-cols-2 gap-4">
        {q.options.map((opt) => {
          const selected = answers[q.key as keyof Answers] === opt.value;
          const label = opt.label[lang];
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAnswer(q.key as keyof Answers, opt.value)}
              className={`group cursor-pointer overflow-hidden rounded-2xl border-2 text-left transition-all duration-150 ${
                selected ? "border-purple-500 shadow-md shadow-purple-100" : "border-neutral-200 hover:border-purple-300"
              }`}
            >
              <div className={`px-3 py-3 text-lg font-semibold transition-colors ${
                selected ? "bg-purple-50 text-purple-700" : "bg-white text-neutral-700"
              }`}>
                {label}
              </div>
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <CdnImage
                  src={opt.img}
                  alt={label}
                  width={320}
                  height={427}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                {selected && <div className="absolute inset-0 bg-purple-500/10" />}
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

  const lang = pickLang(locale);
  const meta = getMbtiMeta(mbti, locale);
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
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-0.5">{CHROME.yourType[lang]}</p>
          <p className="text-5xl font-black tracking-tight text-neutral-900 leading-none">{mbti}</p>
        </div>
        <p className="mb-1 text-base font-medium text-neutral-500 leading-snug">{meta.tagline}</p>
      </div>

      {/* Character gallery */}
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">{CHROME.typeAcrossUniverses[lang]}</p>
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
          {(user ? CHROME.generateCard[lang] : CHROME.unlockCard[lang]).replace("{type}", mbti)}
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
          {CHROME.retake[lang]}
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
  const lang = pickLang(locale);

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
          onClick={() => { setOpen(true); track({ contentId: "mbti_quiz", contentType: "mbti_quiz", actionType: "click" }); }}
          className="fixed bottom-6 right-6 z-40 flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-transform hover:scale-105 hover:shadow-xl active:scale-100"
          aria-label="Take MBTI personality quiz"
        >
          <Sparkles className="h-4 w-4" />
          {CHROME.buttonCTA[lang]}
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
                {!mbti && (
                  <p className="text-lg font-bold text-neutral-900">
                    {CHROME.questionOf[lang]
                      .replace("{n}", String(step + 1))
                      .replace("{total}", String(QUESTIONS.length))}
                  </p>
                )}
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
              <QuizStep step={step} answers={answers} onAnswer={handleAnswer} lang={lang} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
