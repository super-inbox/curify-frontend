"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X, Sparkles, RotateCcw, ChevronRight, Share2, Check, Lock } from "lucide-react";
import { useAtom } from "jotai";
import CdnImage from "./CdnImage";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

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

// ── MBTI metadata ─────────────────────────────────────────────────────────────

const MBTI_META: Record<string, { tagline: string }> = {
  INTJ: { tagline: "The Lone Strategist" },
  INTP: { tagline: "The Quiet Architect of Ideas" },
  ENTJ: { tagline: "The Unstoppable Commander" },
  ENTP: { tagline: "The Devil's Advocate" },
  INFJ: { tagline: "The Visionary Healer" },
  INFP: { tagline: "The Dreamer Who Changes Worlds" },
  ENFJ: { tagline: "The Magnetic Storyteller" },
  ENFP: { tagline: "The Sunshine That Won't Stop" },
  ISTJ: { tagline: "The Unshakeable Rock" },
  ISFJ: { tagline: "The Quiet Guardian" },
  ESTJ: { tagline: "The Architect of Order" },
  ESFJ: { tagline: "The Warmth Everyone Needs" },
  ISTP: { tagline: "The Cool-Headed Maverick" },
  ISFP: { tagline: "The Secret Artist" },
  ESTP: { tagline: "The Thrill-Seeker" },
  ESFP: { tagline: "The Life of Every Room" },
};

// ── IP character pool ─────────────────────────────────────────────────────────

type CharCard = { name: string; img: string; ip: string; templateSlug: string };

const P = (name: string, file: string, ip: string, slug: string): CharCard => ({
  name,
  img: `/images/nano_insp_preview/${file}`,
  ip,
  templateSlug: slug,
});

const CHARACTER_POOL: Record<string, CharCard[]> = {
  INTJ: [
    P("Haku",       "template-mbti-ghibli-haku-prev.jpg",                        "Ghibli",      "template-mbti-ghibli"),
    P("Gus Fring",  "template-mbti-breakingbad-en-gus-fring-prev.jpg",            "Breaking Bad","template-mbti-breakingbad"),
    P("Ross Geller","template-friends-character-mbti-ross-geller-prev.jpg",       "Friends",     "template-friends-character-mbti"),
    P("Itachi",     "template-mbti-naruto-itachi-prev.jpg",                       "Naruto",      "template-mbti-naruto"),
    P("Thanos",     "template-mbti-marvel-thanos-prev.jpg",                       "Marvel",      "template-mbti-marvel"),
  ],
  INTP: [
    P("Calcifer",      "template-mbti-ghibli-calcifer-prev.jpg",                     "Ghibli",      "template-mbti-ghibli"),
    P("Chandler Bing", "template-friends-character-mbti-chandler-bing-prev.jpg",     "Friends",     "template-friends-character-mbti"),
    P("Shikamaru",     "template-mbti-naruto-shikamaru-prev.jpg",                    "Naruto",      "template-mbti-naruto"),
    P("Vision",        "template-mbti-marvel-en-marvel-vision-prev.jpg",             "Marvel",      "template-mbti-marvel"),
  ],
  ENTJ: [
    P("Yubaba",       "template-mbti-ghibli-yubaba-prev.jpg",                        "Ghibli",      "template-mbti-ghibli"),
    P("Walter White", "template-mbti-breakingbad-en-walter-white-prev.jpg",          "Breaking Bad","template-mbti-breakingbad"),
    P("LeBron James", "template-mbti-nba-en-lebronjames-prev.jpg",                   "NBA",         "template-mbti-nba"),
    P("Orochimaru",   "template-mbti-naruto-Orochimaru-prev.jpg",                    "Naruto",      "template-mbti-naruto"),
  ],
  ENTP: [
    P("Catbus",        "template-mbti-ghibli-catbus-prev.jpg",                       "Ghibli",      "template-mbti-ghibli"),
    P("Saul Goodman",  "template-mbti-breakingbad-en-saul-goodman-prev.jpg",         "Breaking Bad","template-mbti-breakingbad"),
    P("Spider-Man",    "template-mbti-marvel-en-spider-man-prev.jpg",                "Marvel",      "template-mbti-marvel"),
    P("Lalo Salamanca","template-mbti-breakingbad-en-lalo-salamanca-prev.jpg",       "Breaking Bad","template-mbti-breakingbad"),
  ],
  INFJ: [
    P("Ashitaka",  "template-mbti-ghibli-ashitaka-prev.jpg",                         "Ghibli",      "template-mbti-ghibli"),
    P("Kim Wexler","template-mbti-breakingbad-en-kim-wexler-prev.jpg",               "Breaking Bad","template-mbti-breakingbad"),
    P("Conan",     "template-detective-conan-conan-edogawa-prev.jpg",                "Conan",       "template-mbti-generic"),
    P("Gamora",    "template-mbti-marvel-en-marvel-gamora-prev.jpg",                 "Marvel",      "template-mbti-marvel"),
  ],
  INFP: [
    P("Sophie",       "template-mbti-ghibli-sophie-prev.jpg",                        "Ghibli",      "template-mbti-ghibli"),
    P("Mike Hannigan","template-friends-character-mbti-mike-hannigan-prev.jpg",      "Friends",     "template-friends-character-mbti"),
    P("Hinata",       "template-mbti-naruto-hinata-prev.jpg",                        "Naruto",      "template-mbti-naruto"),
    P("Groot",        "template-mbti-marvel-en-marvel-groot-prev.jpg",               "Marvel",      "template-mbti-marvel"),
  ],
  ENFJ: [
    P("Howl",          "template-mbti-ghibli-howl-prev.jpg",                         "Ghibli",      "template-mbti-ghibli"),
    P("Captain America","template-mbti-marvel-en-captainamerica-prev.jpg",           "Marvel",      "template-mbti-marvel"),
    P("Minato",        "template-mbti-naruto-Minato-Namikaze-prev.jpg",              "Naruto",      "template-mbti-naruto"),
    P("Magic Johnson", "template-mbti-nba-en-magicjohnson-prev.jpg",                 "NBA",         "template-mbti-nba"),
  ],
  ENFP: [
    P("Ponyo",       "template-mbti-ghibli-ponyo-prev.jpg",                          "Ghibli",      "template-mbti-ghibli"),
    P("Phoebe",      "template-friends-character-mbti-phoebe-buffay-prev.jpg",       "Friends",     "template-friends-character-mbti"),
    P("Naruto",      "template-mbti-naruto-naruto-prev.jpg",                         "Naruto",      "template-mbti-naruto"),
    P("Star-Lord",   "template-mbti-marvel-Star-Lord-prev.jpg",                      "Marvel",      "template-mbti-marvel"),
  ],
  ISTJ: [
    P("Jiro Horikoshi","template-mbti-ghibli-jiro-horikoshi-prev.jpg",              "Ghibli",      "template-mbti-ghibli"),
    P("Chuck McGill",  "template-mbti-breakingbad-en-chuck-mcgill-prev.jpg",         "Breaking Bad","template-mbti-breakingbad"),
    P("Richard Burke", "template-friends-character-mbti-richard-burke-prev.jpg",     "Friends",     "template-friends-character-mbti"),
    P("Tim Duncan",    "template-mbti-nba-en-timduncan-prev.jpg",                    "NBA",         "template-mbti-nba"),
  ],
  ISFJ: [
    P("Chihiro",      "template-mbti-ghibli-chihiro-prev.jpg",                       "Ghibli",      "template-mbti-ghibli"),
    P("Gunther",      "template-friends-character-mbti-gunther-prev.jpg",            "Friends",     "template-friends-character-mbti"),
    P("Ran Mouri",    "template-detective-conan-ran-mouri-prev.jpg",                  "Conan",       "template-mbti-generic"),
    P("Hawkeye",      "template-mbti-marvel-hawkeye-prev.jpg",                       "Marvel",      "template-mbti-marvel"),
  ],
  ESTJ: [
    P("Kiki",         "template-mbti-ghibli-kiki-prev.jpg",                          "Ghibli",      "template-mbti-ghibli"),
    P("Howard Hamlin","template-mbti-breakingbad-en-howard-hamlin.jpg",              "Breaking Bad","template-mbti-breakingbad"),
    P("Monica Geller","template-friends-character-mbti-monica-geller-prev.jpg",      "Friends",     "template-friends-character-mbti"),
    P("Tsunade",      "template-mbti-naruto-Tsunade-prev.jpg",                       "Naruto",      "template-mbti-naruto"),
  ],
  ESFJ: [
    P("Totoro",       "template-mbti-ghibli-totoro-prev.jpg",                        "Ghibli",      "template-mbti-ghibli"),
    P("Skyler White", "template-mbti-breakingbad-en-skyler-white-prev.jpg",          "Breaking Bad","template-mbti-breakingbad"),
    P("Rachel Green", "template-friends-character-mbti-rachel-green-prev.jpg",       "Friends",     "template-friends-character-mbti"),
    P("Sakura",       "template-mbti-naruto-sakura-prev.jpg",                        "Naruto",      "template-mbti-naruto"),
  ],
  ISTP: [
    P("San",        "template-mbti-ghibli-san-prev.jpg",                             "Ghibli",      "template-mbti-ghibli"),
    P("Kakashi",    "template-mbti-naruto-kakashi-prev.jpg",                         "Naruto",      "template-mbti-naruto"),
    P("Black Widow","template-mbti-marvel-en-blackwidow-prev.jpg",                   "Marvel",      "template-mbti-marvel"),
    P("Kobe Bryant","template-mbti-nba-en-kobebryant-prev.jpg",                      "NBA",         "template-mbti-nba"),
  ],
  ISFP: [
    P("Marnie",      "template-mbti-ghibli-marnie-prev.jpg",                         "Ghibli",      "template-mbti-ghibli"),
    P("Jesse Pinkman","template-mbti-breakingbad-en-jesse-pinkman-prev.jpg",         "Breaking Bad","template-mbti-breakingbad"),
    P("Ai Haibara",  "template-detective-conan-ai-haibara-prev.jpg",                 "Conan",       "template-mbti-generic"),
    P("Venom",       "template-mbti-marvel-Venom-prev.jpg",                          "Marvel",      "template-mbti-marvel"),
  ],
  ESTP: [
    P("Porco Rosso",    "template-mbti-ghibli-porco-rosso-prev.jpg",                 "Ghibli",      "template-mbti-ghibli"),
    P("Hank Schrader",  "template-mbti-breakingbad-en-hank-schrader-prev.jpg",       "Breaking Bad","template-mbti-breakingbad"),
    P("Rock Lee",       "template-mbti-naruto-Rock-Lee-prev.jpg",                    "Naruto",      "template-mbti-naruto"),
    P("Allen Iverson",  "template-mbti-nba-en-alleniverson-prev.jpg",                "NBA",         "template-mbti-nba"),
  ],
  ESFP: [
    P("Pazu",          "template-mbti-ghibli-pazu-prev.jpg",                         "Ghibli",      "template-mbti-ghibli"),
    P("Joey Tribbiani","template-friends-character-mbti-joey-tribbiani-prev.jpg",    "Friends",     "template-friends-character-mbti"),
    P("Mbappe",        "template-mbti-nba-kylianmbappe-prev.jpg",                    "NBA",         "template-mbti-nba"),
    P("Thor",          "template-mbti-marvel-en-thorodinson-prev.jpg",               "Marvel",      "template-mbti-marvel"),
  ],
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
              className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-150 ${
                selected ? "border-purple-500 shadow-md shadow-purple-100" : "border-neutral-200 hover:border-purple-300"
              }`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <CdnImage
                  src={opt.img}
                  alt={opt.label}
                  width={260}
                  height={195}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>
              {selected && <div className="absolute inset-0 bg-purple-500/10" />}
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

const IP_COLORS: Record<string, string> = {
  Ghibli:        "bg-green-50 text-green-700",
  "Breaking Bad":"bg-yellow-50 text-yellow-700",
  Friends:       "bg-orange-50 text-orange-700",
  Marvel:        "bg-red-50 text-red-700",
  Naruto:        "bg-blue-50 text-blue-700",
  NBA:           "bg-purple-50 text-purple-700",
  Conan:         "bg-sky-50 text-sky-700",
};

function ResultStep({
  mbti,
  locale,
  onReset,
}: {
  mbti: string;
  locale: string;
  onReset: () => void;
}) {
  const [user] = useAtom(userAtom);
  const [, setDrawer] = useAtom(drawerAtom);
  const [copied, setCopied] = useState(false);

  const meta = MBTI_META[mbti] ?? { tagline: "The Unique One" };
  const chars = CHARACTER_POOL[mbti] ?? [];
  const shown = chars.slice(0, 3);

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?personality=${mbti}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGenerate = (slug: string) => {
    if (!user) { setDrawer("signin"); return; }
    window.open(`/${locale}/nano-template/${slug}`, "_blank");
  };

  // Unique IPs among chars
  const ips = [...new Set(chars.map((c) => c.ip))].slice(0, 4);

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
              <CdnImage
                src={char.img}
                alt={char.name}
                width={140}
                height={186}
                className="h-full w-full object-cover"
              />
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

      {/* Generate CTA (login-gated) */}
      <div className="mb-3 rounded-xl border border-dashed border-purple-200 bg-purple-50 p-3">
        <p className="mb-2 text-xs font-semibold text-purple-700">
          {user ? `Generate your ${mbti} card in any universe →` : `Unlock your ${mbti} card →`}
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

      {/* Share + retake */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Share result"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-500 hover:bg-neutral-50 transition-colors"
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
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  // Read ?personality=TYPE from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("personality")?.toUpperCase();
    if (p && MBTI_META[p]) {
      const ei = p[0] as EI;
      const sn = p[1] as SN;
      const tf = p[2] as TF;
      const jp = p[3] as JP;
      setAnswers({ EI: ei, SN: sn, TF: tf, JP: jp });
      setStep(QUESTIONS.length);
      setOpen(true);
    }
  }, []);

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

  const reset = useCallback(() => {
    setStep(0);
    setAnswers({});
    // Clear URL param
    const url = new URL(window.location.href);
    url.searchParams.delete("personality");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <div className="hidden lg:block">
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-transform hover:scale-105 hover:shadow-xl active:scale-100"
        aria-label="Take MBTI personality quiz"
      >
        <Sparkles className="h-4 w-4" />
        What's your MBTI?
      </button>

      {/* Backdrop + panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
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
