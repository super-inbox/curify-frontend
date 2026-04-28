export type CharCard = { name: string; img: string; ip: string; templateSlug: string };

const C = (name: string, file: string, ip: string, slug: string): CharCard => ({
  name,
  img: `/images/nano_insp_preview/${file}`,
  ip,
  templateSlug: slug,
});

export const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
] as const;

export type MBTIType = typeof MBTI_TYPES[number];

export const MBTI_META: Record<MBTIType, { tagline: string; description: string }> = {
  INTJ: { tagline: "The Lone Strategist",          description: "Rare visionaries who turn long-range plans into reality. Independent, determined, and always ten steps ahead." },
  INTP: { tagline: "The Quiet Architect of Ideas", description: "Endlessly curious thinkers who love picking apart complex systems. Logic is their native language." },
  ENTJ: { tagline: "The Unstoppable Commander",    description: "Natural-born leaders who see inefficiency and fix it. Boldly decisive and relentlessly goal-driven." },
  ENTP: { tagline: "The Devil's Advocate",         description: "Inventive debaters who thrive on challenging every assumption. They turn contradiction into creativity." },
  INFJ: { tagline: "The Visionary Healer",         description: "Deeply empathetic idealists with a rare clarity of purpose. They pursue meaning over comfort." },
  INFP: { tagline: "The Dreamer Who Changes Worlds",description: "Quietly passionate souls guided by a rich inner moral compass. Small in noise, large in impact." },
  ENFJ: { tagline: "The Magnetic Storyteller",     description: "Charismatic and empathetic leaders who inspire others just by being in the room." },
  ENFP: { tagline: "The Sunshine That Won't Stop", description: "Wildly enthusiastic and endlessly curious. They make everything feel like a new beginning." },
  ISTJ: { tagline: "The Unshakeable Rock",         description: "Reliable and methodical, they build things that last. Duty runs deep in everything they do." },
  ISFJ: { tagline: "The Quiet Guardian",           description: "Warm protectors who show love through actions. Attentive to what others need before they ask." },
  ESTJ: { tagline: "The Architect of Order",       description: "Practical organizers who thrive on clear rules and well-defined roles. They make things work." },
  ESFJ: { tagline: "The Warmth Everyone Needs",    description: "Community-builders who remember birthdays, notice moods, and keep everyone together." },
  ISTP: { tagline: "The Cool-Headed Maverick",     description: "Calm in any crisis, hands-on and efficient. They solve problems others haven't noticed yet." },
  ISFP: { tagline: "The Secret Artist",            description: "Gentle and intensely creative, they express worlds of feeling through what they make." },
  ESTP: { tagline: "The Thrill-Seeker",            description: "Bold, quick-thinking, and action-first. They live in the moment and make it memorable." },
  ESFP: { tagline: "The Life of Every Room",       description: "Spontaneous entertainers who bring energy wherever they go. Joy is their superpower." },
};

export const CHARACTER_POOL: Record<MBTIType, CharCard[]> = {
  INTJ: [
    C("Haku",        "template-mbti-ghibli-haku-prev.jpg",                         "Ghibli",      "template-mbti-ghibli"),
    C("Gus Fring",   "template-mbti-breakingbad-en-gus-fring-prev.jpg",             "Breaking Bad","template-mbti-breakingbad"),
    C("Ross Geller", "template-friends-character-mbti-ross-geller-prev.jpg",        "Friends",     "template-friends-character-mbti"),
    C("Itachi",      "template-mbti-naruto-itachi-prev.jpg",                        "Naruto",      "template-mbti-naruto"),
    C("Thanos",      "template-mbti-marvel-thanos-prev.jpg",                        "Marvel",      "template-mbti-marvel"),
  ],
  INTP: [
    C("Calcifer",       "template-mbti-ghibli-calcifer-prev.jpg",                   "Ghibli",      "template-mbti-ghibli"),
    C("Chandler Bing",  "template-friends-character-mbti-chandler-bing-prev.jpg",   "Friends",     "template-friends-character-mbti"),
    C("Shikamaru",      "template-mbti-naruto-shikamaru-prev.jpg",                  "Naruto",      "template-mbti-naruto"),
    C("Vision",         "template-mbti-marvel-en-marvel-vision-prev.jpg",           "Marvel",      "template-mbti-marvel"),
  ],
  ENTJ: [
    C("Yubaba",       "template-mbti-ghibli-yubaba-prev.jpg",                       "Ghibli",      "template-mbti-ghibli"),
    C("Walter White", "template-mbti-breakingbad-en-walter-white-prev.jpg",         "Breaking Bad","template-mbti-breakingbad"),
    C("LeBron James", "template-mbti-nba-en-lebronjames-prev.jpg",                  "NBA",         "template-mbti-nba"),
    C("Orochimaru",   "template-mbti-naruto-Orochimaru-prev.jpg",                   "Naruto",      "template-mbti-naruto"),
  ],
  ENTP: [
    C("Catbus",         "template-mbti-ghibli-catbus-prev.jpg",                     "Ghibli",      "template-mbti-ghibli"),
    C("Saul Goodman",   "template-mbti-breakingbad-en-saul-goodman-prev.jpg",       "Breaking Bad","template-mbti-breakingbad"),
    C("Spider-Man",     "template-mbti-marvel-en-spider-man-prev.jpg",              "Marvel",      "template-mbti-marvel"),
    C("Lalo Salamanca", "template-mbti-breakingbad-en-lalo-salamanca-prev.jpg",     "Breaking Bad","template-mbti-breakingbad"),
  ],
  INFJ: [
    C("Ashitaka",  "template-mbti-ghibli-ashitaka-prev.jpg",                        "Ghibli",      "template-mbti-ghibli"),
    C("Kim Wexler","template-mbti-breakingbad-en-kim-wexler-prev.jpg",              "Breaking Bad","template-mbti-breakingbad"),
    C("Conan",     "template-detective-conan-conan-edogawa-prev.jpg",               "Conan",       "template-mbti-generic"),
    C("Gamora",    "template-mbti-marvel-en-marvel-gamora-prev.jpg",                "Marvel",      "template-mbti-marvel"),
  ],
  INFP: [
    C("Sophie",        "template-mbti-ghibli-sophie-prev.jpg",                      "Ghibli",      "template-mbti-ghibli"),
    C("Mike Hannigan", "template-friends-character-mbti-mike-hannigan-prev.jpg",    "Friends",     "template-friends-character-mbti"),
    C("Hinata",        "template-mbti-naruto-hinata-prev.jpg",                      "Naruto",      "template-mbti-naruto"),
    C("Groot",         "template-mbti-marvel-en-marvel-groot-prev.jpg",             "Marvel",      "template-mbti-marvel"),
  ],
  ENFJ: [
    C("Howl",           "template-mbti-ghibli-howl-prev.jpg",                       "Ghibli",      "template-mbti-ghibli"),
    C("Captain America","template-mbti-marvel-en-captainamerica-prev.jpg",          "Marvel",      "template-mbti-marvel"),
    C("Minato",         "template-mbti-naruto-Minato-Namikaze-prev.jpg",            "Naruto",      "template-mbti-naruto"),
    C("Magic Johnson",  "template-mbti-nba-en-magicjohnson-prev.jpg",              "NBA",         "template-mbti-nba"),
  ],
  ENFP: [
    C("Ponyo",     "template-mbti-ghibli-ponyo-prev.jpg",                           "Ghibli",      "template-mbti-ghibli"),
    C("Phoebe",    "template-friends-character-mbti-phoebe-buffay-prev.jpg",        "Friends",     "template-friends-character-mbti"),
    C("Naruto",    "template-mbti-naruto-naruto-prev.jpg",                          "Naruto",      "template-mbti-naruto"),
    C("Star-Lord", "template-mbti-marvel-Star-Lord-prev.jpg",                       "Marvel",      "template-mbti-marvel"),
  ],
  ISTJ: [
    C("Jiro Horikoshi","template-mbti-ghibli-jiro-horikoshi-prev.jpg",              "Ghibli",      "template-mbti-ghibli"),
    C("Chuck McGill",  "template-mbti-breakingbad-en-chuck-mcgill-prev.jpg",        "Breaking Bad","template-mbti-breakingbad"),
    C("Richard Burke", "template-friends-character-mbti-richard-burke-prev.jpg",    "Friends",     "template-friends-character-mbti"),
    C("Tim Duncan",    "template-mbti-nba-en-timduncan-prev.jpg",                   "NBA",         "template-mbti-nba"),
  ],
  ISFJ: [
    C("Chihiro",   "template-mbti-ghibli-chihiro-prev.jpg",                         "Ghibli",      "template-mbti-ghibli"),
    C("Gunther",   "template-friends-character-mbti-gunther-prev.jpg",              "Friends",     "template-friends-character-mbti"),
    C("Ran Mouri", "template-detective-conan-ran-mouri-prev.jpg",                   "Conan",       "template-mbti-generic"),
    C("Hawkeye",   "template-mbti-marvel-hawkeye-prev.jpg",                         "Marvel",      "template-mbti-marvel"),
  ],
  ESTJ: [
    C("Kiki",         "template-mbti-ghibli-kiki-prev.jpg",                         "Ghibli",      "template-mbti-ghibli"),
    C("Howard Hamlin","template-mbti-breakingbad-en-howard-hamlin.jpg",             "Breaking Bad","template-mbti-breakingbad"),
    C("Monica Geller","template-friends-character-mbti-monica-geller-prev.jpg",     "Friends",     "template-friends-character-mbti"),
    C("Tsunade",      "template-mbti-naruto-Tsunade-prev.jpg",                      "Naruto",      "template-mbti-naruto"),
  ],
  ESFJ: [
    C("Totoro",       "template-mbti-ghibli-totoro-prev.jpg",                       "Ghibli",      "template-mbti-ghibli"),
    C("Skyler White", "template-mbti-breakingbad-en-skyler-white-prev.jpg",         "Breaking Bad","template-mbti-breakingbad"),
    C("Rachel Green", "template-friends-character-mbti-rachel-green-prev.jpg",      "Friends",     "template-friends-character-mbti"),
    C("Sakura",       "template-mbti-naruto-sakura-prev.jpg",                       "Naruto",      "template-mbti-naruto"),
  ],
  ISTP: [
    C("San",        "template-mbti-ghibli-san-prev.jpg",                            "Ghibli",      "template-mbti-ghibli"),
    C("Kakashi",    "template-mbti-naruto-kakashi-prev.jpg",                        "Naruto",      "template-mbti-naruto"),
    C("Black Widow","template-mbti-marvel-en-blackwidow-prev.jpg",                  "Marvel",      "template-mbti-marvel"),
    C("Kobe Bryant","template-mbti-nba-en-kobebryant-prev.jpg",                     "NBA",         "template-mbti-nba"),
  ],
  ISFP: [
    C("Marnie",       "template-mbti-ghibli-marnie-prev.jpg",                       "Ghibli",      "template-mbti-ghibli"),
    C("Jesse Pinkman","template-mbti-breakingbad-en-jesse-pinkman-prev.jpg",        "Breaking Bad","template-mbti-breakingbad"),
    C("Ai Haibara",   "template-detective-conan-ai-haibara-prev.jpg",               "Conan",       "template-mbti-generic"),
    C("Venom",        "template-mbti-marvel-Venom-prev.jpg",                        "Marvel",      "template-mbti-marvel"),
  ],
  ESTP: [
    C("Porco Rosso",   "template-mbti-ghibli-porco-rosso-prev.jpg",                 "Ghibli",      "template-mbti-ghibli"),
    C("Hank Schrader", "template-mbti-breakingbad-en-hank-schrader-prev.jpg",       "Breaking Bad","template-mbti-breakingbad"),
    C("Rock Lee",      "template-mbti-naruto-Rock-Lee-prev.jpg",                    "Naruto",      "template-mbti-naruto"),
    C("Allen Iverson", "template-mbti-nba-en-alleniverson-prev.jpg",                "NBA",         "template-mbti-nba"),
  ],
  ESFP: [
    C("Pazu",          "template-mbti-ghibli-pazu-prev.jpg",                        "Ghibli",      "template-mbti-ghibli"),
    C("Joey Tribbiani","template-friends-character-mbti-joey-tribbiani-prev.jpg",   "Friends",     "template-friends-character-mbti"),
    C("Mbappe",        "template-mbti-nba-kylianmbappe-prev.jpg",                   "NBA",         "template-mbti-nba"),
    C("Thor",          "template-mbti-marvel-en-thorodinson-prev.jpg",              "Marvel",      "template-mbti-marvel"),
  ],
};

export const IP_COLORS: Record<string, string> = {
  Ghibli:        "bg-green-100 text-green-700",
  "Breaking Bad":"bg-yellow-100 text-yellow-700",
  Friends:       "bg-orange-100 text-orange-700",
  Marvel:        "bg-red-100 text-red-700",
  Naruto:        "bg-blue-100 text-blue-700",
  NBA:           "bg-purple-100 text-purple-700",
  Conan:         "bg-sky-100 text-sky-700",
};
