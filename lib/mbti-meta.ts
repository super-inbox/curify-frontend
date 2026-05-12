export const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
] as const;

export type MBTIType = typeof MBTI_TYPES[number];

// Locale-keyed strings. We hand-curate EN + zh + es (covers our top traffic).
// All other locales fall back to EN via pickLang(). Promote to a full i18n
// namespace only if/when we add more covered languages.
export type QuizLang = "en" | "zh" | "es";
export type Localized = Record<QuizLang, string>;

export function pickLang(locale: string): QuizLang {
  if (locale === "zh") return "zh";
  if (locale === "es") return "es";
  return "en";
}

const MBTI_META_RAW: Record<MBTIType, { tagline: Localized; description: Localized }> = {
  INTJ: {
    tagline: {
      en: "The Lone Strategist",
      zh: "孤独的战略家",
      es: "El Estratega Solitario",
    },
    description: {
      en: "Rare visionaries who turn long-range plans into reality. Independent, determined, and always ten steps ahead.",
      zh: "罕见的远见者，能把长远规划变成现实。独立、坚定，永远领先十步。",
      es: "Visionarios poco comunes que convierten planes a largo plazo en realidad. Independientes, decididos y siempre diez pasos por delante.",
    },
  },
  INTP: {
    tagline: {
      en: "The Quiet Architect of Ideas",
      zh: "思想的静默建筑师",
      es: "El Arquitecto Silencioso de las Ideas",
    },
    description: {
      en: "Endlessly curious thinkers who love picking apart complex systems. Logic is their native language.",
      zh: "永不知足的好奇思考者，热衷于剖析复杂系统。逻辑是他们的母语。",
      es: "Pensadores infinitamente curiosos que aman desmenuzar sistemas complejos. La lógica es su lengua materna.",
    },
  },
  ENTJ: {
    tagline: {
      en: "The Unstoppable Commander",
      zh: "势不可挡的指挥官",
      es: "El Comandante Imparable",
    },
    description: {
      en: "Natural-born leaders who see inefficiency and fix it. Boldly decisive and relentlessly goal-driven.",
      zh: "天生的领导者，能发现低效并加以改进。果敢决断，目标导向，永不松懈。",
      es: "Líderes natos que ven la ineficiencia y la corrigen. Audazmente decididos y enfocados sin tregua en sus objetivos.",
    },
  },
  ENTP: {
    tagline: {
      en: "The Devil's Advocate",
      zh: "唱反调的辩论家",
      es: "El Abogado del Diablo",
    },
    description: {
      en: "Inventive debaters who thrive on challenging every assumption. They turn contradiction into creativity.",
      zh: "富有创意的辩论者，热衷于挑战每一个前提。他们把矛盾化为创造力。",
      es: "Debatientes ingeniosos que prosperan desafiando cada suposición. Convierten la contradicción en creatividad.",
    },
  },
  INFJ: {
    tagline: {
      en: "The Visionary Healer",
      zh: "富有远见的疗愈者",
      es: "El Sanador Visionario",
    },
    description: {
      en: "Deeply empathetic idealists with a rare clarity of purpose. They pursue meaning over comfort.",
      zh: "极富同理心的理想主义者，目标清晰而坚定。他们追求意义，胜过舒适。",
      es: "Idealistas profundamente empáticos con una rara claridad de propósito. Persiguen el significado por encima de la comodidad.",
    },
  },
  INFP: {
    tagline: {
      en: "The Dreamer Who Changes Worlds",
      zh: "改变世界的梦想家",
      es: "El Soñador Que Cambia Mundos",
    },
    description: {
      en: "Quietly passionate souls guided by a rich inner moral compass. Small in noise, large in impact.",
      zh: "静默而充满热情的灵魂，内心有着丰富的道德罗盘。声音不大，影响深远。",
      es: "Almas silenciosamente apasionadas guiadas por una rica brújula moral interior. Discretas en el ruido, enormes en el impacto.",
    },
  },
  ENFJ: {
    tagline: {
      en: "The Magnetic Storyteller",
      zh: "魅力四射的讲述者",
      es: "El Narrador Magnético",
    },
    description: {
      en: "Charismatic and empathetic leaders who inspire others just by being in the room.",
      zh: "富有魅力与同理心的领导者，只是身处其中就能鼓舞他人。",
      es: "Líderes carismáticos y empáticos que inspiran a los demás con solo estar en la sala.",
    },
  },
  ENFP: {
    tagline: {
      en: "The Sunshine That Won't Stop",
      zh: "永不熄灭的阳光",
      es: "El Sol Que No Se Apaga",
    },
    description: {
      en: "Wildly enthusiastic and endlessly curious. They make everything feel like a new beginning.",
      zh: "热情奔放、好奇心永无止境。他们让一切都像崭新的开始。",
      es: "Tremendamente entusiastas e infinitamente curiosos. Hacen que todo se sienta como un nuevo comienzo.",
    },
  },
  ISTJ: {
    tagline: {
      en: "The Unshakeable Rock",
      zh: "坚如磐石的守护者",
      es: "La Roca Inquebrantable",
    },
    description: {
      en: "Reliable and methodical, they build things that last. Duty runs deep in everything they do.",
      zh: "可靠而有条理，他们打造经得起时间考验的事物。责任感贯穿他们所做的一切。",
      es: "Fiables y metódicos, construyen cosas que perduran. El deber corre profundo en todo lo que hacen.",
    },
  },
  ISFJ: {
    tagline: {
      en: "The Quiet Guardian",
      zh: "沉默的守护者",
      es: "El Guardián Silencioso",
    },
    description: {
      en: "Warm protectors who show love through actions. Attentive to what others need before they ask.",
      zh: "温暖的守护者，用行动表达爱意。在他人开口之前就察觉到需要。",
      es: "Protectores cálidos que demuestran amor con acciones. Atentos a lo que los demás necesitan antes de que lo pidan.",
    },
  },
  ESTJ: {
    tagline: {
      en: "The Architect of Order",
      zh: "秩序的建立者",
      es: "El Arquitecto del Orden",
    },
    description: {
      en: "Practical organizers who thrive on clear rules and well-defined roles. They make things work.",
      zh: "务实的组织者，在清晰的规则和明确的角色中游刃有余。他们让一切运转有序。",
      es: "Organizadores prácticos que prosperan con reglas claras y roles bien definidos. Hacen que las cosas funcionen.",
    },
  },
  ESFJ: {
    tagline: {
      en: "The Warmth Everyone Needs",
      zh: "大家都需要的温暖",
      es: "La Calidez Que Todos Necesitan",
    },
    description: {
      en: "Community-builders who remember birthdays, notice moods, and keep everyone together.",
      zh: "社群的建设者，记得每个人的生日，察觉每个人的情绪，让大家紧紧相连。",
      es: "Constructores de comunidad que recuerdan cumpleaños, notan los estados de ánimo y mantienen a todos unidos.",
    },
  },
  ISTP: {
    tagline: {
      en: "The Cool-Headed Maverick",
      zh: "冷静的独行者",
      es: "El Inconformista de Cabeza Fría",
    },
    description: {
      en: "Calm in any crisis, hands-on and efficient. They solve problems others haven't noticed yet.",
      zh: "危机中依然冷静，动手能力强且高效。他们能解决他人尚未察觉的问题。",
      es: "Calmados ante cualquier crisis, prácticos y eficientes. Resuelven problemas que otros aún no han notado.",
    },
  },
  ISFP: {
    tagline: {
      en: "The Secret Artist",
      zh: "隐秘的艺术家",
      es: "El Artista Secreto",
    },
    description: {
      en: "Gentle and intensely creative, they express worlds of feeling through what they make.",
      zh: "温柔而富有强烈创造力，他们用作品诉说内心丰富的情感世界。",
      es: "Suaves e intensamente creativos, expresan mundos de sentimientos a través de lo que crean.",
    },
  },
  ESTP: {
    tagline: {
      en: "The Thrill-Seeker",
      zh: "追求刺激的冒险家",
      es: "El Buscador de Emociones",
    },
    description: {
      en: "Bold, quick-thinking, and action-first. They live in the moment and make it memorable.",
      zh: "大胆、机敏、行动优先。他们活在当下，并让当下值得铭记。",
      es: "Audaces, de pensamiento rápido y orientados a la acción. Viven el momento y lo hacen memorable.",
    },
  },
  ESFP: {
    tagline: {
      en: "The Life of Every Room",
      zh: "全场的焦点",
      es: "El Alma de la Fiesta",
    },
    description: {
      en: "Spontaneous entertainers who bring energy wherever they go. Joy is their superpower.",
      zh: "自然而然的氛围制造者，无论到哪里都自带能量。喜悦是他们的超能力。",
      es: "Animadores espontáneos que llevan energía a donde van. La alegría es su superpoder.",
    },
  },
};

export function getMbtiMeta(type: MBTIType, locale: string): { tagline: string; description: string } {
  const lang = pickLang(locale);
  const m = MBTI_META_RAW[type];
  return { tagline: m.tagline[lang], description: m.description[lang] };
}

// EN-only flat view kept for back-compat with non-locale-aware callers.
// Prefer getMbtiMeta(type, locale) in new code.
export const MBTI_META: Record<MBTIType, { tagline: string; description: string }> = Object.fromEntries(
  MBTI_TYPES.map((t) => [
    t,
    { tagline: MBTI_META_RAW[t].tagline.en, description: MBTI_META_RAW[t].description.en },
  ])
) as Record<MBTIType, { tagline: string; description: string }>;

// Quiz UI chrome strings — header, result captions, retake CTA.
export const MBTI_UI: Record<
  "testHeader" | "youAre" | "seeFullResult" | "retake",
  Localized
> = {
  testHeader: {
    en: "Visual Personality Test",
    zh: "视觉人格测试",
    es: "Test Visual de Personalidad",
  },
  youAre: {
    en: "You are",
    zh: "你是",
    es: "Eres",
  },
  seeFullResult: {
    en: "See full result",
    zh: "查看完整结果",
    es: "Ver resultado completo",
  },
  retake: {
    en: "Retake",
    zh: "重新测试",
    es: "Volver a hacer",
  },
};

export function getMbtiUi(locale: string): Record<keyof typeof MBTI_UI, string> {
  const lang = pickLang(locale);
  return {
    testHeader: MBTI_UI.testHeader[lang],
    youAre: MBTI_UI.youAre[lang],
    seeFullResult: MBTI_UI.seeFullResult[lang],
    retake: MBTI_UI.retake[lang],
  };
}

export const IP_COLORS: Record<string, string> = {
  Ghibli:         "bg-green-100 text-green-700",
  "Breaking Bad": "bg-yellow-100 text-yellow-700",
  Friends:        "bg-orange-100 text-orange-700",
  Marvel:         "bg-red-100 text-red-700",
  NBA:            "bg-purple-100 text-purple-700",
};
