export const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
] as const;

export type MBTIType = typeof MBTI_TYPES[number];

export const MBTI_META: Record<MBTIType, { tagline: string; description: string }> = {
  INTJ: { tagline: "The Lone Strategist",           description: "Rare visionaries who turn long-range plans into reality. Independent, determined, and always ten steps ahead." },
  INTP: { tagline: "The Quiet Architect of Ideas",  description: "Endlessly curious thinkers who love picking apart complex systems. Logic is their native language." },
  ENTJ: { tagline: "The Unstoppable Commander",     description: "Natural-born leaders who see inefficiency and fix it. Boldly decisive and relentlessly goal-driven." },
  ENTP: { tagline: "The Devil's Advocate",          description: "Inventive debaters who thrive on challenging every assumption. They turn contradiction into creativity." },
  INFJ: { tagline: "The Visionary Healer",          description: "Deeply empathetic idealists with a rare clarity of purpose. They pursue meaning over comfort." },
  INFP: { tagline: "The Dreamer Who Changes Worlds", description: "Quietly passionate souls guided by a rich inner moral compass. Small in noise, large in impact." },
  ENFJ: { tagline: "The Magnetic Storyteller",      description: "Charismatic and empathetic leaders who inspire others just by being in the room." },
  ENFP: { tagline: "The Sunshine That Won't Stop",  description: "Wildly enthusiastic and endlessly curious. They make everything feel like a new beginning." },
  ISTJ: { tagline: "The Unshakeable Rock",          description: "Reliable and methodical, they build things that last. Duty runs deep in everything they do." },
  ISFJ: { tagline: "The Quiet Guardian",            description: "Warm protectors who show love through actions. Attentive to what others need before they ask." },
  ESTJ: { tagline: "The Architect of Order",        description: "Practical organizers who thrive on clear rules and well-defined roles. They make things work." },
  ESFJ: { tagline: "The Warmth Everyone Needs",     description: "Community-builders who remember birthdays, notice moods, and keep everyone together." },
  ISTP: { tagline: "The Cool-Headed Maverick",      description: "Calm in any crisis, hands-on and efficient. They solve problems others haven't noticed yet." },
  ISFP: { tagline: "The Secret Artist",             description: "Gentle and intensely creative, they express worlds of feeling through what they make." },
  ESTP: { tagline: "The Thrill-Seeker",             description: "Bold, quick-thinking, and action-first. They live in the moment and make it memorable." },
  ESFP: { tagline: "The Life of Every Room",        description: "Spontaneous entertainers who bring energy wherever they go. Joy is their superpower." },
};

export const IP_COLORS: Record<string, string> = {
  Ghibli:         "bg-green-100 text-green-700",
  "Breaking Bad": "bg-yellow-100 text-yellow-700",
  Friends:        "bg-orange-100 text-orange-700",
  Marvel:         "bg-red-100 text-red-700",
  NBA:            "bg-purple-100 text-purple-700",
};
