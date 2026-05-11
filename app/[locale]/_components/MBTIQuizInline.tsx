"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import CdnImage from "./CdnImage";
import { getMbtiMeta, getMbtiUi, pickLang, IP_COLORS } from "@/lib/mbti-meta";
import type { MBTIType, Localized } from "@/lib/mbti-meta";
import mbtiCharacters from "@/public/data/mbti_characters.json";
import { useTracking } from "@/services/useTracking";

type EI = "E" | "I";
type SN = "S" | "N";
type TF = "T" | "F";
type JP = "J" | "P";
type Answers = { EI?: EI; SN?: SN; TF?: TF; JP?: JP };

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
        label: {
          en: "Out with the crowd",
          zh: "和大伙儿一起热闹",
          es: "Saliendo con la multitud",
        },
        img: "/images/nano_insp/template-group-vocab-category-animals.jpg",
      },
      {
        value: "I",
        label: {
          en: "Alone in my own world",
          zh: "独自待在自己的世界",
          es: "A solas en mi propio mundo",
        },
        img: "/images/nano_insp/template-interior-design-mood-board-generator-bedroom.jpg",
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
        label: {
          en: "Discovering real local flavors",
          zh: "寻找地道的当地风味",
          es: "Descubrir sabores locales auténticos",
        },
        img: "/images/nano_insp/template-food-zh-italian-pasta.jpg",
      },
      {
        value: "N",
        label: {
          en: "The thrill of the unknown",
          zh: "探索未知的刺激",
          es: "La emoción de lo desconocido",
        },
        img: "/images/nano_insp/template-travel-zh-xishuangbanna.jpg",
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
        label: {
          en: "Logic & clear reasoning",
          zh: "逻辑与清晰的推理",
          es: "Lógica y razonamiento claro",
        },
        img: "/images/nano_insp/template-figure-principles-infographic-albert-einstein.jpg",
      },
      {
        value: "F",
        label: {
          en: "Gut feeling & what's right",
          zh: "直觉与内心的正义",
          es: "La intuición y lo que es correcto",
        },
        img: "/images/nano_insp/template-fashion-before-after-outfit-annotation-card-emerald-jewelry.jpg",
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
        label: {
          en: "Reserved, researched, ready",
          zh: "预定好、研究好、准备好",
          es: "Reservado, investigado, listo",
        },
        img: "/images/nano_insp/template-travel-zh-beijing.jpg",
      },
      {
        value: "P",
        label: {
          en: "Wing it & see what happens",
          zh: "随心而动，看会发生什么",
          es: "Improvisar y ver qué pasa",
        },
        img: "/images/nano_insp/template-mbti-animal-zh-cafe.jpg",
      },
    ],
  },
];

export default function MBTIQuizInline({ locale }: { locale: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const { track } = useTracking();
  const lang = pickLang(locale);
  const ui = getMbtiUi(locale);

  const done = step === QUESTIONS.length;
  const mbti = done
    ? (`${answers.EI ?? "I"}${answers.SN ?? "N"}${answers.TF ?? "T"}${answers.JP ?? "J"}` as MBTIType)
    : null;

  const handleAnswer = (key: keyof Answers, value: string) => {
    if (step === 0) track({ contentId: "mbti_quiz", contentType: "mbti_quiz", actionType: "click" });
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => setStep((s) => s + 1), 240);
  };

  const reset = () => { setStep(0); setAnswers({}); };

  const q = !done ? QUESTIONS[step] : null;
  const meta = mbti ? getMbtiMeta(mbti, locale) : null;
  const chars = mbti ? ((mbtiCharacters as Record<string, typeof mbtiCharacters.INTJ>)[mbti] ?? []).slice(0, 3) : [];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-purple-500">
          {ui.testHeader}
        </span>
      </div>

      {!done ? (
        <>
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-4">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < step ? "w-4 bg-purple-400" : i === step ? "w-4 bg-purple-600" : "w-1.5 bg-purple-200"
                }`}
              />
            ))}
          </div>

          <p className="text-base font-semibold text-neutral-900 mb-4">{q!.q[lang]}</p>

          <div className="grid grid-cols-2 gap-3">
            {q!.options.map((opt) => {
              const selected = answers[q!.key] === opt.value;
              const label = opt.label[lang];
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAnswer(q!.key, opt.value)}
                  className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                    selected ? "border-purple-500" : "border-white hover:border-purple-300"
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <CdnImage
                      src={opt.img}
                      alt={label}
                      width={220}
                      height={165}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </div>
                  {selected && <div className="absolute inset-0 bg-purple-500/10" />}
                  <div className={`px-3 py-2 text-xs font-semibold ${selected ? "bg-purple-50 text-purple-700" : "bg-white text-neutral-700"}`}>
                    {label}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* Result */
        <div className="flex gap-4 items-start">
          {/* Character images */}
          <div className="flex gap-2 shrink-0">
            {chars.map((char) => (
              <div key={char.name} className="relative w-20 overflow-hidden rounded-xl">
                <div className="aspect-[3/4]">
                  <CdnImage
                    src={char.img}
                    alt={char.name}
                    width={80}
                    height={107}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1.5">
                  <p className="text-[10px] font-bold text-white leading-tight truncate">{char.name}</p>
                  <span className={`text-[9px] font-semibold rounded-full px-1 ${IP_COLORS[char.ip] ?? ""}`}>
                    {char.ip}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Type + CTA */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 mb-0.5">{ui.youAre}</p>
            <p className="text-4xl font-black tracking-tight text-neutral-900 leading-none">{mbti}</p>
            <p className="mt-1 text-sm text-neutral-600 leading-snug">{meta?.tagline}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/${locale}/personality/${mbti}`}
                onClick={() => track({ contentId: mbti!, contentType: "mbti_quiz", actionType: "share" })}
                className="flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
              >
                {ui.seeFullResult}
                <ChevronRight className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-50 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                {ui.retake}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
